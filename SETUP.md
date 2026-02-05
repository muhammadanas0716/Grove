# Setup Guide

## Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Set up Convex:
```bash
npx convex dev
```
This will:
- Create a Convex project (if needed)
- Generate `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT`
- Add them to your `.env.local`

3. Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```
Add the output to `.env.local` as `AUTH_SECRET=...`

4. Set up Polar.sh:
- Go to [Polar.sh Dashboard](https://polar.sh)
- Create a product with price $4.67/month
- Get your Access Token from Settings → API
- Get your Webhook Secret from Settings → Webhooks
- Get your Product ID from the product page
- Add to `.env.local`:
  - `POLAR_ACCESS_TOKEN=your_access_token`
  - `POLAR_WEBHOOK_SECRET=your_webhook_secret`
  - `POLAR_PRODUCT_ID=your_product_id`
  - `POLAR_SERVER=sandbox` (or `production` for live)
  - `POLAR_SUCCESS_URL=http://localhost:4000/subscribe/success` (or your production URL)
  - `POLAR_RETURN_URL=http://localhost:4000/subscribe` (or your production URL)
  - `NEXT_PUBLIC_APP_URL=http://localhost:4000` (or your production URL)

5. Configure Polar.sh Webhook:
- In Polar.sh Dashboard → Settings → Webhooks
- Add webhook URL: `https://your-domain.com/api/polar/webhook`
- Select events: `subscription.created`, `subscription.updated`, `subscription.canceled`, `checkout.updated`

## Running the App

1. Start Convex dev server:
```bash
npm run convex:dev
```

2. Start Next.js dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:4000`

## Deploying

1. Deploy Convex:
```bash
npm run convex:deploy
```

2. Deploy Next.js to Vercel or your preferred platform
3. Update environment variables in your deployment platform:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOYMENT`
   - `AUTH_SECRET`
   - `POLAR_ACCESS_TOKEN`
   - `POLAR_WEBHOOK_SECRET`
   - `POLAR_PRODUCT_ID`
   - `POLAR_SERVER=production`
   - `POLAR_SUCCESS_URL` (optional if you rely on request origin)
   - `POLAR_RETURN_URL` (optional if you rely on request origin)
   - `NEXT_PUBLIC_APP_URL` (optional if you rely on request origin)
4. Update Polar.sh webhook URL to your production URL
