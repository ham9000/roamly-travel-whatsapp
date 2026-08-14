import { createHmac, timingSafeEqual } from 'node:crypto'
import dotenv from 'dotenv'
import express from 'express'
import { ConversationManager } from './conversation.js'
import type { IncomingMessage, WhatsAppWebhook } from './types.js'
import { WhatsAppClient } from './whatsapp.js'

dotenv.config()

const requiredEnvironment = [
  'WHATSAPP_VERIFY_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
] as const

for (const name of requiredEnvironment) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
}

if (process.env.NODE_ENV === 'production' && !process.env.META_APP_SECRET) {
  throw new Error('META_APP_SECRET is required in production')
}

const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN!
const appSecret = process.env.META_APP_SECRET ?? ''
const conversations = new ConversationManager()
const whatsapp = new WhatsAppClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  graphApiVersion: process.env.META_GRAPH_API_VERSION ?? 'v23.0',
})
const processedMessageIds = new Set<string>()
const app = express()

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'roamly-whatsapp-bot' })
})

app.get('/webhook', (request, response) => {
  const mode = request.query['hub.mode']
  const token = request.query['hub.verify_token']
  const challenge = request.query['hub.challenge']

  if (mode === 'subscribe' && token === verifyToken && typeof challenge === 'string') {
    response.status(200).send(challenge)
    return
  }

  response.sendStatus(403)
})

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  const rawBody = request.body as Buffer
  const signature = request.header('x-hub-signature-256')

  if (appSecret && !isValidSignature(rawBody, signature, appSecret)) {
    response.sendStatus(401)
    return
  }

  let payload: WhatsAppWebhook
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as WhatsAppWebhook
  } catch {
    response.sendStatus(400)
    return
  }

  response.sendStatus(200)
  void processWebhook(payload).catch((error: unknown) => {
    console.error('Failed to process WhatsApp webhook:', error)
  })
})

async function processWebhook(payload: WhatsAppWebhook): Promise<void> {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value?.messages) {
        continue
      }

      const names = new Map(
        (value.contacts ?? [])
          .filter((contact) => contact.wa_id)
          .map((contact) => [contact.wa_id!, contact.profile?.name]),
      )

      for (const message of value.messages) {
        if (processedMessageIds.has(message.id)) {
          continue
        }

        rememberMessage(message.id)
        await whatsapp.markAsRead(message.id)

        const input = getMessageInput(message)
        if (!input) {
          await whatsapp.sendReply(message.from, {
            type: 'text',
            body: 'I can currently understand text and button replies. Send “menu” to get started.',
          })
          continue
        }

        const replies = conversations.handle(message.from, input, names.get(message.from))
        for (const reply of replies) {
          await whatsapp.sendReply(message.from, reply)
        }
      }
    }
  }
}

function getMessageInput(message: IncomingMessage): string | undefined {
  if (message.type === 'text') {
    return message.text?.body
  }

  if (message.type === 'interactive') {
    return (
      message.interactive?.button_reply?.id ??
      message.interactive?.list_reply?.id
    )
  }

  if (message.type === 'button') {
    return message.button?.payload ?? message.button?.text
  }

  return undefined
}

function isValidSignature(
  body: Buffer,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature?.startsWith('sha256=')) {
    return false
  }

  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  )
}

function rememberMessage(messageId: string): void {
  processedMessageIds.add(messageId)
  if (processedMessageIds.size > 1_000) {
    const oldest = processedMessageIds.values().next().value
    if (oldest) {
      processedMessageIds.delete(oldest)
    }
  }
}

app.listen(port, () => {
  console.log(`Roamly WhatsApp bot listening on port ${port}`)
})
