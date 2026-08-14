import type { BotReply } from './types.js'

type ConversationStep =
  | 'idle'
  | 'destination'
  | 'dates'
  | 'travelers'
  | 'budget'
  | 'human'

type TripDetails = {
  destination?: string
  dates?: string
  travelers?: string
  budget?: string
}

type Conversation = {
  step: ConversationStep
  trip: TripDetails
}

const menuReply = (name?: string): BotReply => ({
  type: 'buttons',
  body: `${name ? `Hi ${name}!` : 'Hi!'} I'm Roamly, your travel planning assistant. What would you like to do?`,
  buttons: [
    { id: 'plan_trip', title: 'Plan a trip' },
    { id: 'explore_trips', title: 'Explore trips' },
    { id: 'talk_to_human', title: 'Talk to a person' },
  ],
})

export class ConversationManager {
  private readonly conversations = new Map<string, Conversation>()

  handle(userId: string, input: string, name?: string): BotReply[] {
    const message = input.trim()
    const normalized = message.toLowerCase()
    const command =
      {
        plan: 'plan_trip',
        'plan a trip': 'plan_trip',
        explore: 'explore_trips',
        'explore trips': 'explore_trips',
        human: 'talk_to_human',
        'talk to a person': 'talk_to_human',
      }[normalized] ?? normalized

    if (
      !message ||
      ['hi', 'hello', 'hey', 'start', 'menu', 'help', 'restart'].includes(normalized)
    ) {
      this.conversations.set(userId, { step: 'idle', trip: {} })
      return [menuReply(name)]
    }

    const conversation = this.conversations.get(userId) ?? {
      step: 'idle' as const,
      trip: {},
    }

    if (command === 'plan_trip') {
      conversation.step = 'destination'
      conversation.trip = {}
      this.conversations.set(userId, conversation)
      return [
        {
          type: 'text',
          body: 'Great choice! Where would you like to go? You can name a country, city, or say something like "somewhere warm."',
        },
      ]
    }

    if (command === 'explore_trips') {
      this.conversations.set(userId, { step: 'idle', trip: {} })
      return [
        {
          type: 'text',
          body:
            'Here are three traveler favorites:\n\n' +
            '🇬🇷 Santorini — 5 days from $1,299\n' +
            '🇮🇩 Bali — 7 days from $1,549\n' +
            '🇲🇦 Marrakech — 6 days from $1,149',
        },
        {
          type: 'buttons',
          body: 'Want me to build a trip around one of these?',
          buttons: [
            { id: 'plan_trip', title: 'Plan my trip' },
            { id: 'talk_to_human', title: 'Ask an expert' },
          ],
        },
      ]
    }

    if (command === 'talk_to_human') {
      conversation.step = 'human'
      this.conversations.set(userId, conversation)
      return [
        {
          type: 'text',
          body: 'Absolutely. I’ve flagged this chat for a travel expert. Send any extra details here and a person can continue the conversation with you.',
        },
      ]
    }

    if (command === 'start_over') {
      this.conversations.set(userId, { step: 'idle', trip: {} })
      return [menuReply(name)]
    }

    switch (conversation.step) {
      case 'destination':
        conversation.trip.destination = message
        conversation.step = 'dates'
        this.conversations.set(userId, conversation)
        return [
          {
            type: 'text',
            body: `Nice—${message} sounds exciting. What dates are you considering? Approximate dates are fine.`,
          },
        ]

      case 'dates':
        conversation.trip.dates = message
        conversation.step = 'travelers'
        this.conversations.set(userId, conversation)
        return [
          {
            type: 'text',
            body: 'How many people will be traveling? Please send a number from 1 to 20.',
          },
        ]

      case 'travelers': {
        const count = Number.parseInt(message, 10)
        if (!Number.isInteger(count) || count < 1 || count > 20) {
          return [
            {
              type: 'text',
              body: 'Please send the number of travelers as a number from 1 to 20.',
            },
          ]
        }

        conversation.trip.travelers = String(count)
        conversation.step = 'budget'
        this.conversations.set(userId, conversation)
        return [
          {
            type: 'text',
            body: 'What is your approximate total budget? You can reply with an amount or a range, such as "$3,000–$4,000."',
          },
        ]
      }

      case 'budget': {
        conversation.trip.budget = message
        conversation.step = 'idle'
        this.conversations.set(userId, conversation)

        const { destination, dates, travelers, budget } = conversation.trip
        return [
          {
            type: 'text',
            body:
              'Here’s your trip request:\n\n' +
              `📍 Destination: ${destination}\n` +
              `📅 Dates: ${dates}\n` +
              `👥 Travelers: ${travelers}\n` +
              `💰 Budget: ${budget}\n\n` +
              'A travel expert can use this to create your personalized itinerary.',
          },
          {
            type: 'buttons',
            body: 'What would you like to do next?',
            buttons: [
              { id: 'talk_to_human', title: 'Send to an expert' },
              { id: 'start_over', title: 'Plan another trip' },
            ],
          },
        ]
      }

      case 'human':
        return []

      case 'idle':
      default:
        return [
          {
            type: 'text',
            body: 'I didn’t recognize that option. Send “menu” to see what I can help with.',
          },
        ]
    }
  }
}
