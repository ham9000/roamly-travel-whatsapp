export type BotReply =
  | {
      type: 'text'
      body: string
    }
  | {
      type: 'buttons'
      body: string
      buttons: Array<{ id: string; title: string }>
    }

export type IncomingMessage = {
  id: string
  from: string
  type: string
  text?: { body?: string }
  button?: { payload?: string; text?: string }
  interactive?: {
    type?: string
    button_reply?: { id?: string; title?: string }
    list_reply?: { id?: string; title?: string }
  }
}

export type WhatsAppWebhook = {
  object?: string
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{
          wa_id?: string
          profile?: { name?: string }
        }>
        messages?: IncomingMessage[]
      }
    }>
  }>
}
