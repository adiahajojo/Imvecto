# Imvecto

**Fund Impact. Verify Progress. Prove Outcomes.**

Imvecto is an AI-powered trust infrastructure for real-world impact
projects — combining Brickken-tokenized funding on Sepolia with an
AI verification and monitoring layer. Built for the Build with Brickken
hackathon and the AI Academy Nigeria Pitchathon as one unified product.

## What's live

- Public browsing — home, explore, individual project pages, no login needed
- Email magic link sign in (NextAuth + Resend HTTP API)
- Wallet connect (RainbowKit + wagmi, Sepolia)
- Project creation flow, admin verification screen
- Real, confirmed on-chain Brickken tokenization + STO for SOLA
  (Solar Power for 10 Rural Schools) — see transaction hashes below
- Impact Passport page + JSON export endpoint
- Passport-style hero and featured project card design

## What's next

1. Test `newInvest` end to end (connect wallet, fund SOLA, confirm
   contribution + tx hash recorded) — approve step is working (wallet
   signs, transaction confirmed on Sepolia); currently blocked on
   Brickken requiring investor registration before newInvest accepts
   the wallet ("Investor not found"), waiting on Brickken support
2. Impact Agent — fixed tool set (search_projects, get_project,
   get_project_progress, get_impact_passport, prepare_funding,
   get_milestones, request_evidence). Rule: agent prepares, human
   approves, wallet signs.
3. AI project intelligence — summarization, Q&A, risk extraction
4. Evidence workflow — upload, AI image analysis, verifier review
5. Bring explore/project detail/passport pages to the current design

## Stack

Next.js 14 (App Router) · TypeScript · Prisma/Postgres (Supabase) ·
NextAuth · Resend · wagmi + RainbowKit + Reown · Brickken sandbox API
(Sepolia)

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. `npm install`
3. `npm run db:push`
4. `npm run dev`

## Verified transactions (Sepolia)

- SOLA tokenization: `0x2020cae5109b08725d2b719fce7b632c603fa43659917a8492bc68922bfbc337`
- SOLA STO: `0xe5482213e9c728210915862a0d29fb752210dd7dad910c96c29896b36175391c`
