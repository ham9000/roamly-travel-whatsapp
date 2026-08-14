import { createHmac, timingSafeEqual } from 'node:crypto'
import dotenv from 'dotenv'
import express from 'express'
import { ConversationManager } from './conversation.js'
import {
  sendTwilioReplies,
  validateTwilioRequest,
} from './twilio.js'
import type { IncomingMessage, WhatsAppWebhook } from './types.js'
import { WhatsAppClient } from './whatsapp.js'
import twilio from 'twilio'

dotenv.config()

const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN ?? ''
const appSecret = process.env.META_APP_SECRET ?? ''
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID ?? ''
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN ?? ''
const twilioWebhookUrl = process.env.TWILIO_WEBHOOK_URL ?? ''
const conversations = new ConversationManager()
const whatsapp =
  process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    ? new WhatsAppClient({
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        graphApiVersion: process.env.META_GRAPH_API_VERSION ?? 'v23.0',
      })
    : undefined
const processedMessageIds = new Set<string>()
const twilioClient =
  twilioAccountSid && twilioAuthToken
    ? twilio(twilioAccountSid, twilioAuthToken)
    : undefined
const app = express()

app.set('trust proxy', true)

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'roamly-whatsapp-bot',
    providers: {
      meta: Boolean(whatsapp && verifyToken),
      twilio: Boolean(twilioClient),
    },
  })
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
  if (!whatsapp) {
    response.sendStatus(503)
    return
  }

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

app.post(
  '/twilio/webhook',
  express.urlencoded({ extended: false }),
  async (request, response) => {
    if (!twilioClient || !twilioAuthToken) {
      console.error(
        'Twilio webhook received, but TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not configured.',
      )
      response.sendStatus(503)
      return
    }

    const params = request.body as Record<string, string>
    const signature = request.header('x-twilio-signature')
    const requestUrl =
      twilioWebhookUrl ||
      `${request.protocol}://${request.get('host')}${request.originalUrl}`

    if (
      twilioAuthToken &&
      !validateTwilioRequest(twilioAuthToken, signature, requestUrl, params)
    ) {
      response.sendStatus(401)
      return
    }

    const from = params.From
    const to = params.To
    const body = params.Body
    if (!from || !to || !body) {
      response.sendStatus(400)
      return
    }

    const replies = conversations.handle(from, body, params.ProfileName)
    try {
      await sendTwilioReplies(
        (message) => twilioClient.messages.create(message),
        to,
        from,
        replies,
      )
      response.sendStatus(204)
    } catch (error: unknown) {
      console.error('Failed to send Twilio WhatsApp reply:', error)
      response.sendStatus(502)
    }
  },
)

async function processWebhook(payload: WhatsAppWebhook): Promise<void> {
  if (!whatsapp) {
    return
  }

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
