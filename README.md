# fete

A lightweight, mobile-first event invite platform. Black and white. Emoji-forward. No app download needed.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (mobile-first, black and white)
- **Prisma + PostgreSQL** via [Neon](https://neon.tech)
- **Twilio** for SMS (falls back to mock when unconfigured)
- **Vercel** for hosting

---

## Local development

### 1. Get a free Postgres database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project — copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local — paste your Neon connection string as DATABASE_URL
```

### 3. Install and migrate

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a mobile-sized browser window.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
cd ~/work/fete
git init
git add .
git commit -m "initial commit"
gh repo create fete --public --source=. --push
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your `fete` repo
2. In the Vercel dashboard, go to **Storage** → **Connect Database** → **Neon** (or add your Neon connection string manually as `DATABASE_URL` in environment variables)
3. Click **Deploy**

After deploy, run the migration once:

```bash
npx vercel env pull .env.local   # pulls Vercel's env vars locally
npm run db:push                  # applies schema to the production DB
```

### 3. Add Twilio for real SMS (optional)

1. Sign up at [twilio.com](https://twilio.com)
2. Buy a phone number (~$1/month)
3. Add these to your Vercel environment variables:
   - `TWILIO_ACCOUNT_SID` — from Twilio Console
   - `TWILIO_AUTH_TOKEN` — from Twilio Console
   - `TWILIO_FROM_NUMBER` — your Twilio phone number (e.g. `+15551234567`)
4. Redeploy — SMS reminders will now send for real

Without Twilio env vars, reminder messages are stored in the dashboard's Messages tab instead of actually being sent.

---

## App routes

| Route | Description |
|---|---|
| `/` | Home |
| `/create` | Create an event |
| `/event/[id]` | Public event page + RSVP |
| `/dashboard/[id]` | Host dashboard |

## API routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/events` | Create event |
| GET | `/api/events/[id]` | Get event with RSVPs and messages |
| POST | `/api/rsvp` | Create or update an RSVP |
| POST | `/api/reminders/[eventId]` | Send reminders to opted-in guests |
