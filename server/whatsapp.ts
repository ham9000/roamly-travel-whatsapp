import type { BotReply } from './types.js'

type WhatsAppClientConfig = {
  accessToken: string
  phoneNumberId: string
  graphApiVersion: string
}

export class WhatsAppClient {
  private readonly endpoint: string

  constructor(private readonly config: WhatsAppClientConfig) {
    this.endpoint = `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`
  }

  async sendReply(to: string, reply: BotReply): Promise<void> {
    if (reply.type === 'text') {
      await this.request({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: reply.body },
      })
      return
    }

    await this.request({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: reply.body },
        action: {
          buttons: reply.buttons.map((button) => ({
            type: 'reply',
            reply: button,
          })),
        },
      },
    })
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.request({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    })
  }

  private async request(body: object): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`WhatsApp API request failed (${response.status}): ${detail}`)
    }
  }
}
