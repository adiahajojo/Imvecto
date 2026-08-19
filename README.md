# Imvecto, starter

This is the Phase 1 setup from the project plan. Frontend, backend, and
database in one Next.js app, with email sign in and wallet connect wired
up separately, the way the plan describes.

## What is here

- Public home and explore pages, no login needed to browse
- Email magic link sign in, through NextAuth
- Wallet connect, through RainbowKit and wagm, targeting Sepolia
- A dashboard page that is the one place login is required
- A Prisma schema matching the database structure from the plan

## What is not here yet

- Project creation form
- Admin verification screen
- Brickken integration (the funding module)
- The Impact Agent
- The Impact Passport view

Those come in the phases after this one.

## Setup

1. Copy `.env.example` to `.env` and fill in the values. You need a
   Postgres database, an email provider for magic links, and a
   WalletConnect project id.

2. Install dependencies

```
npm install
```

3. Push the schema to your database

```
npm run db:push
```

4. Run the dev server

```
npm run dev
```

Open `http://localhost:3000`. You should be able to browse the home
page with no login. Sign in through `/login` to reach `/dashboard`.
Connect a wallet through the button in the nav bar at any time, that
is separate from being signed in.

## Where login and wallet connect fit

Browsing is public. Signing in with email is only required to create
a project or see your own activity. Connecting a wallet is only
required at the moment someone actually funds a project, and it is
not tied to the email account, someone can browse and sign in without
ever connecting a wallet.

## Next steps, in order

1. Add the project creation form under a signed in route
2. Add the admin verification screen
3. Add the Brickken integration module, server side only, following
   section 16 of the plan
4. Seed the four demo projects, Sola, Surg, Schol, Renov
5. Add the Impact Agent
6. Add the Impact Passport view
