import { Injectable } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/_services/auth.service';
import { SettingService } from '../setting/_services/setting.service';

@Injectable({ providedIn: 'root' })
export class PusherService {
  private client: Pusher | null = null;
  private dynamicKey: string = '';
  private dynamicCluster: string = '';
  private activeSubscriptions = new Set<string>();
  private initInFlight$: Observable<boolean> | null = null;

  constructor(
    private auth: AuthService,
    private settingService: SettingService
  ) {}

  /**
   * Fetch current Pusher credentials dynamically from backend /setting/pusher
   */
  initFromBackend(): Observable<boolean> {
    if (this.client) return of(true);
    if (this.initInFlight$) return this.initInFlight$;

    this.initInFlight$ = this.settingService.getPusher().pipe(
      map((res: any) => {
        const item = res?.item ?? res?.data?.item ?? res?.data ?? res ?? {};
        const key = item.pusher_app_key ?? item.key ?? item.PUSHER_APP_KEY ?? environment.pusherKey;
        const cluster = item.pusher_app_cluster ?? item.cluster ?? item.PUSHER_APP_CLUSTER ?? environment.pusherCluster ?? 'ap2';
        if (key) {
          this.configure(key, cluster);
          return true;
        }
        return false;
      }),
      catchError(() => {
        if (environment.pusherKey) {
          this.configure(environment.pusherKey, environment.pusherCluster || 'ap2');
          return of(true);
        }
        return of(false);
      }),
      finalize(() => {
        this.initInFlight$ = null;
      }),
      shareReplay(1)
    );

    return this.initInFlight$;
  }

  configure(key: string, cluster?: string): void {
    const cl = cluster || 'ap2';
    if (this.dynamicKey === key && this.dynamicCluster === cl && this.client) {
      return;
    }
    this.dynamicKey = key;
    this.dynamicCluster = cl;

    // Disconnect existing client if settings changed
    if (this.client) {
      this.disconnect();
    }
    this.ensureClient();
  }

  private ensureClient(): Pusher | null {
    const key = this.dynamicKey || environment.pusherKey;
    const cluster = this.dynamicCluster || environment.pusherCluster || 'ap2';

    if (!key) {
      console.warn('[Pusher] No pusherKey configured. Real-time features disabled.');
      return null;
    }

    if (!this.client) {
      this.client = new Pusher(key, {
        cluster: cluster,
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${this.auth.getToken() || ''}`,
          },
        },
      });

      this.client.connection.bind('connected', () => {
        console.log('[Pusher] WebSocket connected successfully');
      });

      this.client.connection.bind('disconnected', () => {
        console.log('[Pusher] WebSocket disconnected');
      });

      this.client.connection.bind('error', (err: any) => {
        console.error('[Pusher] WebSocket error:', err);
      });
    }

    return this.client;
  }

  subscribe(channelName: string): Channel | null {
    const client = this.ensureClient();
    if (!client) return null;
    console.log(`[Pusher] Subscribing to channel: ${channelName}`);
    this.activeSubscriptions.add(channelName);
    const channel = client.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`[Pusher] Subscription succeeded: ${channelName}`);
    });

    channel.bind('pusher:subscription_error', (status: any) => {
      console.error(`[Pusher] Subscription error on ${channelName}:`, status);
    });

    return channel;
  }

  /** True when pusherKey is configured */
  get isEnabled(): boolean {
    return !!(this.dynamicKey || environment.pusherKey);
  }

  unsubscribe(channelName: string): void {
    console.log(`[Pusher] Unsubscribing from channel: ${channelName}`);
    this.activeSubscriptions.delete(channelName);
    this.client?.unsubscribe(channelName);
  }

  disconnect(): void {
    this.activeSubscriptions.clear();
    this.client?.disconnect();
    this.client = null;
  }
}
