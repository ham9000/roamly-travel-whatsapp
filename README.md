# Roamly Travel

A responsive travel landing page that turns destination interest and trip details into pre-filled WhatsApp conversations.

## Features

- Curated destination and package cards
- WhatsApp calls to action throughout the site
- Personalized trip inquiry form
- Mobile navigation and responsive layouts
- Configurable WhatsApp business number
- Accessible form labels, navigation, and reduced-motion support

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Add your WhatsApp number in international format without spaces or symbols:

   ```env
   VITE_WHATSAPP_NUMBER=15551234567
   ```

   If no number is configured, WhatsApp opens the message composer and lets the visitor choose a contact.

4. Start the development server:

   ```bash
   npm run dev
   ```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run the linter |
| `npm run preview` | Preview the production build |

## Production checklist

- Replace the Roamly name and sample package content with your brand and real inventory.
- Set `VITE_WHATSAPP_NUMBER` in the hosting provider's environment variables.
- Replace the remote demo images with owned or properly licensed images.
- Add your privacy policy, terms, cancellation policy, and business contact details.
- Connect analytics and a booking or payment provider if customers will pay online.

## Deploy

The generated `dist` directory can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static web host. Run `npm run build` before deployment.
