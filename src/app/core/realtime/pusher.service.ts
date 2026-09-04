import { Injectable } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/_services/auth.service';

@Injectable({ providedIn: 'root' })
export class PusherService {
  private client: Pusher | null = null;

  constructor(private auth: AuthService) {}

  private ensureClient(): Pusher | null {
    if (!environment.pusherKey) {
      return null;
    }
    if (!this.client) {
      this.client = new Pusher(environment.pusherKey, {
        cluster: environment.pusherCluster || 'mt1',
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${this.auth.getToken() || ''}`,
          },
        },
      });
    }
    return this.client;
  }

  subscribe(channelName: string): Channel | null {
    const client = this.ensureClient();
    if (!client) return null;
    return client.subscribe(channelName);
  }

  unsubscribe(channelName: string): void {
    this.client?.unsubscribe(channelName);
  }

  disconnect(): void {
    this.client?.disconnect();
    this.client = null;
  }
}
