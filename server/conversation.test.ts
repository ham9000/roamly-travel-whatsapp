import assert from 'node:assert/strict'
import test from 'node:test'
import { ConversationManager } from './conversation.js'

test('shows the main menu for a greeting', () => {
  const conversations = new ConversationManager()
  const replies = conversations.handle('15550000001', 'hello', 'Jamie')

  assert.equal(replies.length, 1)
  assert.equal(replies[0]?.type, 'buttons')
  assert.match(replies[0]?.body ?? '', /Hi Jamie/)
})

test('collects and summarizes a complete trip request', () => {
  const conversations = new ConversationManager()
  const user = '15550000002'

  conversations.handle(user, 'plan_trip')
  conversations.handle(user, 'Japan')
  conversations.handle(user, 'October 10-18')
  conversations.handle(user, '2')
  const replies = conversations.handle(user, '$4,000')

  assert.equal(replies.length, 2)
  assert.match(replies[0]?.body ?? '', /Destination: Japan/)
  assert.match(replies[0]?.body ?? '', /Dates: October 10-18/)
  assert.match(replies[0]?.body ?? '', /Travelers: 2/)
  assert.match(replies[0]?.body ?? '', /Budget: \$4,000/)
})

test('rejects an invalid traveler count without advancing', () => {
  const conversations = new ConversationManager()
  const user = '15550000003'

  conversations.handle(user, 'plan_trip')
  conversations.handle(user, 'Bali')
  conversations.handle(user, 'November')
  const invalidReply = conversations.handle(user, 'a few')
  const validReply = conversations.handle(user, '4')

  assert.match(invalidReply[0]?.body ?? '', /number from 1 to 20/)
  assert.match(validReply[0]?.body ?? '', /approximate total budget/)
})

test('stops automated replies after human handoff', () => {
  const conversations = new ConversationManager()
  const user = '15550000004'

  const handoff = conversations.handle(user, 'talk_to_human')
  const followUp = conversations.handle(user, 'I need help with a visa')

  assert.match(handoff[0]?.body ?? '', /travel expert/)
  assert.deepEqual(followUp, [])
})

test('accepts text commands used by the Twilio sandbox', () => {
  const conversations = new ConversationManager()
  const user = '15550000005'

  const planReply = conversations.handle(user, 'PLAN')

  assert.match(planReply[0]?.body ?? '', /Where would you like to go/)
})
