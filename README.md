# Roamly Travel WhatsApp Bot

Roamly combines a responsive travel website with a real WhatsApp Cloud API bot. Travelers can message the business in WhatsApp, browse trip ideas, build a trip request, and ask for a human travel expert.

## What the WhatsApp bot does

- Greets travelers with interactive menu buttons
- Shows featured trip ideas
- Collects destination, dates, traveler count, and budget
- Summarizes the completed trip request
- Stops automation when the traveler requests a person
- Validates Meta webhook signatures in production
- Ignores duplicate webhook deliveries

## How it works

```text
Traveler in WhatsApp
        ↓
Meta WhatsApp Cloud API
        ↓ webhook
Roamly Node.js bot
        ↓
Conversation flow + replies
        ↓
Meta WhatsApp Cloud API
        ↓
Traveler receives the response in WhatsApp
```

This requires the official Meta WhatsApp Cloud API. A normal personal WhatsApp number cannot run custom bot code by itself.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Start the website:

   ```bash
   npm run dev
   ```

4. Start the bot backend in a second terminal:

   ```bash
   npm run bot:dev
   ```

5. Confirm the bot is running at `http://localhost:3000/health`.

## Connect the bot to WhatsApp

1. Create or open an app at [Meta for Developers](https://developers.facebook.com/apps).
2. Add the **WhatsApp** product and connect a WhatsApp Business Account.
3. In **WhatsApp → API Setup**, copy the access token and Phone Number ID into `.env`:

   ```env
   WHATSAPP_ACCESS_TOKEN=your-access-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
   ```

4. Create your own long random webhook verification value:

   ```env
   WHATSAPP_VERIFY_TOKEN=your-private-verification-value
   ```

5. Copy the Meta app secret from **App settings → Basic**:

   ```env
   META_APP_SECRET=your-meta-app-secret
   ```

6. Make the bot publicly reachable over HTTPS. For local testing, use a trusted tunnel such as ngrok or Cloudflare Tunnel. For regular use, deploy the backend to a Node.js host such as Render, Railway, Fly.io, or Azure.
7. In **WhatsApp → Configuration**, set:
   - Callback URL: `https://your-public-host/webhook`
   - Verify token: the same value as `WHATSAPP_VERIFY_TOKEN`
8. Verify the webhook and subscribe to the `messages` webhook field.
9. Add your personal phone as a test recipient in the Meta dashboard, then send `hello` to the Meta test number.

Meta provides a temporary test number and token during development. For production, add and verify a business phone number and replace the temporary token with a permanent system-user access token.

## Test with Twilio WhatsApp Sandbox

Twilio's Sandbox provides end-to-end phone testing without registering a production business number.

1. Create a Twilio trial account and open **Messaging → Try it out → Send a WhatsApp message**.
2. Activate the Sandbox, then scan its QR code or send the displayed `join ...` message from your WhatsApp.
3. Keep the bot running:

   ```bash
   npm run bot:dev
   ```

4. Keep ngrok running in a second terminal:

   ```bash
   ngrok http 3000
   ```

5. In Twilio's **Try out WhatsApp** screen, select **Inbound**. Choose the custom webhook option and enter:

   ```text
   https://your-ngrok-domain.ngrok-free.app/twilio/webhook
   ```

   Use HTTP `POST` if Twilio asks for the method.

6. Copy the **Auth Token** from the Twilio Console into `.env`, and set the exact webhook URL:

   ```env
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_WEBHOOK_URL=https://your-ngrok-domain.ngrok-free.app/twilio/webhook
   ```

7. Restart `npm run bot:dev`, then send `hello` to the Twilio Sandbox number. The Sandbox uses text commands instead of buttons: `PLAN`, `EXPLORE`, `HUMAN`, and `MENU`.

When the ngrok domain changes, update both Twilio's webhook field and `TWILIO_WEBHOOK_URL`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | Number opened by buttons on the website |
| `WHATSAPP_VERIFY_TOKEN` | Private value used during webhook verification |
| `WHATSAPP_ACCESS_TOKEN` | Meta token used to send replies |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta identifier for the sending number |
| `META_APP_SECRET` | Validates that webhook requests came from Meta |
| `META_GRAPH_API_VERSION` | Graph API version enabled for the Meta app |
| `TWILIO_AUTH_TOKEN` | Validates incoming Twilio Sandbox webhooks |
| `TWILIO_WEBHOOK_URL` | Exact public Twilio webhook URL used for validation |
| `PORT` | Backend HTTP port; defaults to `3000` |

Never commit `.env` or any Meta access token. The repository ignores local environment files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the travel website |
| `npm run bot:dev` | Start the bot backend with automatic reload |
| `npm run bot:start` | Run the compiled bot backend |
| `npm run test` | Run conversation-flow tests |
| `npm run build` | Build the website and bot |
| `npm run lint` | Lint website and bot source |

## Production considerations

- The current conversation state is held in memory. Use Redis or a database before running multiple server instances.
- Add a CRM or database to store leads and assign human agents.
- Use approved WhatsApp message templates when initiating conversations outside the 24-hour customer-service window.
- Add privacy, consent, retention, and deletion policies before collecting customer data.
- Replace the sample destinations, prices, branding, and images with real business content.

## Official documentation

- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Business Platform message API](https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-phone-number/message-api/)
