## Lemon Squeezy Integration Guide

This document describes how Seentics integrates Lemon Squeezy for subscriptions and billing. It covers products/checkout, environment variables, webhooks, API endpoints, and local testing.

---

### Components and flow
- Frontend (Next.js) opens hosted checkout links (Standard/Pro) and links to the customer portal.
- Users service (Node.js/MongoDB) receives Lemon Squeezy webhooks and updates the `Subscription` model.
- API Gateway proxies requests: `/api/v1/user/*` → users service.

---

### Environment variables
Set these in your root `.env` (see `.env.example`).

Frontend (Next.js):
- `NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT` — hosted checkout URL for Standard
- `NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT` — hosted checkout URL for Pro

Users service:
- `LEMON_SQUEEZY_WEBHOOK_SECRET` — webhook signing secret
- `LEMON_SQUEEZY_API_KEY` — if you call Lemon’s API (optional)
- `LEMON_SQUEEZY_STORE_ID` — optional

Gateway (optional):
- `USER_SERVICE_URL`, `API_GATEWAY_PORT` — already configured in the repo

---

### Products and checkout links
1) Create products/variants in Lemon Squeezy for your plans (Standard, Pro).
2) Copy the hosted checkout URLs and assign them to
   - `NEXT_PUBLIC_LEMON_SQUEEZY_STANDARD_CHECKOUT`
   - `NEXT_PUBLIC_LEMON_SQUEEZY_PRO_CHECKOUT`
3) (Optional) Pre-fill customer info via query params when you redirect:
   - `checkout[custom][userId]=<USER_ID>`
   - `checkout[email]=<EMAIL>`

The billing page uses these links to redirect users to checkout.

---

### Webhooks (users service)
Endpoint: `POST /api/v1/user/webhooks/lemon-squeezy`

Implementation: `services/users/src/routes/webhooks.js`
- Uses `express.raw({ type: 'application/json' })` and validates `X-Signature` with `LEMON_SQUEEZY_WEBHOOK_SECRET`.
- Handles events:
  - `order_created` — creates/updates a `Subscription` with basic billing info
  - `subscription_created` — sets status/renew dates/limits
  - `subscription_updated` — updates status/renew dates/plan/limits
  - `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`

Plan mapping and limits:
- Update `mapProductIdToPlan(productId)` and `getPlanLimits(productId)` in `webhooks.js` to match your real product IDs.

Auto-provisioning:
- If a user has no subscription, the users service auto-creates a `free` plan on first `/current` fetch (see `services/users/src/routes/subscriptions.js`).

---

### Frontend APIs used
Located in `frontend/src/lib/subscription-api.ts` (proxied through gateway):
- `GET /user/subscriptions/current` — current plan/status/limits
- `GET /user/subscriptions/usage` — usage/limits snapshot
- `POST /user/subscriptions/cancel` — marks subscription as cancelled (local state)
- Upgrade: `upgradeSubscription(planId)` redirects to your Lemon checkout URL

The billing page (`/websites/[websiteId]/billing`) renders plan details, usage, and actions.

---

### Customer portal
Use Lemon Squeezy’s customer portal link to allow users to manage payment methods and invoices. Configure the link in the billing UI (set a NEXT_PUBLIC_* portal URL if desired).

---

### Local development and testing
Webhook delivery when running locally:
1) Expose users service via a tunnel (e.g., `ngrok http 3001`).
2) Set Lemon Squeezy webhook URL to: `https://<your-ngrok-domain>/api/v1/user/webhooks/lemon-squeezy`.
3) Set `LEMON_SQUEEZY_WEBHOOK_SECRET` in users service env to match the Lemon Squeezy webhook secret.
4) Trigger test events from Lemon’s dashboard.

Verifications:
- Users service logs will print the event names.
- MongoDB `Subscription` documents should be created/updated for the matching user.
- Frontend billing page should reflect the new plan/status/limits.

---

### Troubleshooting
- 401 Invalid webhook signature: verify `LEMON_SQUEEZY_WEBHOOK_SECRET` and that the request body is raw.
- Plan not changing: ensure `mapProductIdToPlan` matches your real product IDs.
- Frontend still shows Free: user must be authenticated; ensure gateway routes and tokens are correct.
- Checkout redirect does nothing: set `NEXT_PUBLIC_LEMON_SQUEEZY_*` envs and restart frontend.

---

### Useful references
- Users service webhooks: `services/users/src/routes/webhooks.js`
- Users service subscriptions API: `services/users/src/routes/subscriptions.js`
- Subscription model: `services/users/src/models/Subscription.js`
- Frontend billing page: `frontend/src/app/websites/[websiteId]/billing/page.tsx`
- Frontend subscription API client: `frontend/src/lib/subscription-api.ts`
