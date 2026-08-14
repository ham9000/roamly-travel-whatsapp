import twilio from 'twilio'
import type { BotReply } from './types.js'

const commandLabels: Record<string, string> = {
  plan_trip: 'PLAN',
  explore_trips: 'EXPLORE',
  talk_to_human: 'HUMAN',
  start_over: 'MENU',
}

export function createTwilioResponse(replies: BotReply[]): string {
  const response = new twilio.twiml.MessagingResponse()

  for (const reply of replies) {
    response.message(formatTwilioReply(reply))
  }

  return response.toString()
}

export function formatTwilioReply(reply: BotReply): string {
  if (reply.type === 'text') {
    return reply.body
  }

  const options = reply.buttons
    .map((button) => `${commandLabels[button.id] ?? button.id} — ${button.title}`)
    .join('\n')

  return `${reply.body}\n\nReply with:\n${options}`
}

export function validateTwilioRequest(
  authToken: string,
  signature: string | undefined,
  url: string,
  params: Record<string, string>,
): boolean {
  return Boolean(
    signature && twilio.validateRequest(authToken, signature, url, params),
  )
}
