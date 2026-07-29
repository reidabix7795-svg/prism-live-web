# Deploy Prism Live to a permanent Vercel website

This is the real web application—not the static demo. Its chat route calls OpenAI **from the server**, so the OpenAI key is never sent to visitors' browsers.

## What you need

- A free Vercel account: https://vercel.com
- An OpenAI API account and API key with billing enabled
- A GitHub account (recommended for permanent updates)
- Later: a custom domain you purchase from a registrar

## Deploy from GitHub (recommended)

1. Create a new private GitHub repository named `prism-live-web`.
2. Upload the contents of this folder to that repository. Do **not** upload `.env.local` and never commit a real API key.
3. In Vercel, select **Add New → Project → Import** the GitHub repository.
4. Framework preset: Vercel will detect **Next.js** automatically. Keep the defaults and deploy.
5. In **Project → Settings → Environment Variables**, add:

   ```text
   OPENAI_API_KEY = your real OpenAI server key
   OPENAI_MODEL = gpt-4.1-mini
   NEXT_PUBLIC_SITE_URL = https://your-vercel-project.vercel.app
   ```

6. Redeploy after saving variables. Send a chat message to verify it works.
7. In Vercel **Settings → Domains**, add a custom domain once purchased. Vercel will show the exact DNS records to enter at your domain registrar.
8. Change `NEXT_PUBLIC_SITE_URL` to the custom-domain URL and redeploy.

## Deploy from your own computer with the Vercel CLI

```bash
cd prism-live-web
npm install
npm install --global vercel
vercel
vercel --prod
```

Then add the same environment variables in Vercel Project Settings and redeploy.

## Test locally first

```bash
cd prism-live-web
cp .env.example .env.local
# edit .env.local and add your real OPENAI_API_KEY
npm install
npm run dev
```

Open http://localhost:3000. The production build has been checked successfully using `npm run build`.

## Before sharing it widely

This first release is a live AI-chat MVP: five AI personalities, voice dictation (browser supported), browser text-to-speech, and a server-side OpenAI route.

Before charging money or allowing large traffic, add:

- Sign-in and account deletion (for example Supabase Auth)
- Durable rate limiting (Upstash Redis), replacing the starter in-memory limiter
- A database for encrypted/appropriate chat history and user preferences
- Moderation, abuse reporting, observability, spend caps and provider usage alerts
- A complete public Privacy Policy, Terms, support email and cookie policy as applicable
- Billing/subscriptions (Stripe on web; RevenueCat/Google Play for Android)

Do not add real-money crypto execution to this public MVP without specialist legal, compliance and security work. Do not state that AI is 100% accurate or that it can guarantee profit.
