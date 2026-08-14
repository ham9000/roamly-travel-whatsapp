import assert from 'node:assert/strict'
import test from 'node:test'
import { createTwilioResponse, formatTwilioReply } from './twilio.js'

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

test('creates valid TwiML with escaped message text', () => {
  const xml = createTwilioResponse([
    { type: 'text', body: 'Trips & travel <made easy>' },
  ])

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?><Response>/)
  assert.match(xml, /Trips &amp; travel &lt;made easy&gt;/)
})
