import twilio from 'twilio'
import type { BotReply } from './types.js'

const commandLabels: Record<string, string> = {
  plan_trip: 'PLAN',
  explore_trips: 'EXPLORE',
  talk_to_human: 'HUMAN',
  start_over: 'MENU',
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

type CreateMessage = (message: {
  body: string
  from: string
  to: string
}) => Promise<unknown>

export async function sendTwilioReplies(
  createMessage: CreateMessage,
  from: string,
  to: string,
  replies: BotReply[],
): Promise<void> {
  for (const reply of replies) {
    await createMessage({
      body: formatTwilioReply(reply),
      from,
      to,
    })
  }
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
