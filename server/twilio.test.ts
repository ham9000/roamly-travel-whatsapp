import assert from 'node:assert/strict'
import test from 'node:test'
import { formatTwilioReply, sendTwilioReplies } from './twilio.js'

test('turns WhatsApp buttons into text commands for the Twilio sandbox', () => {
  const message = formatTwilioReply({
    type: 'buttons',
    body: 'What would you like to do?',
    buttons: [
      { id: 'plan_trip', title: 'Plan a trip' },
      { id: 'explore_trips', title: 'Explore trips' },
      { id: 'talk_to_human', title: 'Talk to a person' },
    ],
  })

  assert.match(message, /PLAN — Plan a trip/)
  assert.match(message, /EXPLORE — Explore trips/)
  assert.match(message, /HUMAN — Talk to a person/)
})

test('sends replies through the Twilio Messages API', async () => {
  const messages: Array<{ body: string; from: string; to: string }> = []

  await sendTwilioReplies(
    async (message) => {
      messages.push(message)
    },
    'whatsapp:+15550000001',
    'whatsapp:+15550000002',
    [{ type: 'text', body: 'Welcome to Roamly' }],
  )

  assert.deepEqual(messages, [
    {
      body: 'Welcome to Roamly',
      from: 'whatsapp:+15550000001',
      to: 'whatsapp:+15550000002',
    },
  ])
})
