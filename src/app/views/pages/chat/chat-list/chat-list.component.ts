import { Component, OnDestroy, OnInit } from '@angular/core'
import { ConversationService } from '../../../../core/conversation/_services/conversation.service'
import { PusherService } from '../../../../core/realtime/pusher.service'

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit, OnDestroy {
  rows: any[] = []
  messages: any[] = []
  selected: any = null
  draft = ''
  loading = true
  messagesLoading = false
  error = ''
  private channelName = ''

  constructor(
    private service: ConversationService,
    private pusher: PusherService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  ngOnDestroy(): void {
    if (this.channelName) {
      this.pusher.unsubscribe(this.channelName)
    }
  }

  load(): void {
    this.loading = true
    this.error = ''
    this.service.getAll({}).subscribe({
      next: (data: any) => {
        this.rows = Array.isArray(data) ? data : data?.items || data?.list || []
        this.loading = false
      },
      error: () => {
        this.error = 'Failed to load chat'
        this.loading = false
      },
    })
  }

  open(row: any): void {
    if (this.channelName) {
      this.pusher.unsubscribe(this.channelName)
      this.channelName = ''
    }
    this.selected = row
    this.messagesLoading = true
    this.service.getMessages(row.id).subscribe({
      next: (data: any) => {
        const payload = data?.messages || data?.items || data || []
        this.messages = Array.isArray(payload) ? payload : []
        this.messagesLoading = false
        this.channelName = `chat.${row.id}`
        const ch = this.pusher.subscribe(this.channelName)
        ch?.bind('NewChatMessage', (msg: any) => {
          this.messages = [...this.messages, msg]
        })
        ch?.bind('NewPublicChatMessage', (msg: any) => {
          this.messages = [...this.messages, msg]
        })
      },
      error: () => {
        this.messagesLoading = false
      },
    })
  }

  send(): void {
    if (!this.selected || !this.draft.trim()) return
    const body = {
      conversation_id: this.selected.id,
      message: this.draft.trim(),
    }
    this.service.sendMessage(body).subscribe({
      next: (res: any) => {
        const msg = res?.data || res
        if (msg?.message || msg?.id) {
          this.messages = [...this.messages, msg]
        }
        this.draft = ''
      },
    })
  }
}
