import { stdin as input, stdout as output } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { ConversationManager } from './conversation.js'
import { formatTwilioReply } from './twilio.js'

const readline = createInterface({ input, output })
const conversations = new ConversationManager()
const userId = 'local-simulator'

async function main(): Promise<void> {
  console.log('Roamly local bot simulator')
  console.log('Type a reply and press Enter. Type "exit" to stop.\n')

  printReplies(conversations.handle(userId, 'hello', 'Traveler'))
  output.write('\nYou: ')

  for await (const message of readline) {
    if (message.trim().toLowerCase() === 'exit') {
      break
    }

    const replies = conversations.handle(userId, message)
    if (replies.length === 0) {
      console.log('\nRoamly: Automation paused for human handoff.')
    } else {
      printReplies(replies)
    }

    output.write('\nYou: ')
  }

  readline.close()
}

void main().catch((error: unknown) => {
  console.error('Simulator failed:', error)
  process.exitCode = 1
})

function printReplies(replies: ReturnType<ConversationManager['handle']>): void {
  for (const reply of replies) {
    console.log(`\nRoamly: ${formatTwilioReply(reply)}`)
  }
}
