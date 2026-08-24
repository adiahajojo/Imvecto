# Imvecto

**Fund Impact. Verify Progress. Prove Outcomes.**

Imvecto is trust infrastructure for impact projects, combining Brickken-tokenized funding on Sepolia with an AI verification and monitoring layer.

## What's live

- Public browsing: home, explore, individual project pages, no login needed
- Email magic link sign-in (NextAuth + Resend HTTP API)
- Wallet connect (RainbowKit + wagmi, Sepolia)
- Project creation flow, admin verification screen
- Confirmed on-chain Brickken tokenization and STO for SOLA (Solar Power for 10 Rural Schools). Transaction hashes are listed below
- Full funding flow, connect wallet, whitelist, approve, invest, with a visible, copyable Sepolia Etherscan transaction link on the confirmation screen
- Imvecto Impact Agent: an AI agent with 7 tools (search_projects, get_project, get_project_progress, get_impact_passport, prepare_funding, get_milestones, request_evidence), tested and working with tool calling. Rule: the agent prepares, a human approves, the wallet signs. The agent never touches a wallet directly
- AI project summaries on each project page, generated from live funding and milestone data
- Impact Passport page with a JSON export endpoint
- Passport-style hero and featured project card design
- Keyword-based icon matching for project cards (water, solar, education, health, and so on)
- Token symbol uniqueness validation on project creation

## What's next

1. Q&A and risk extraction to round out AI project intelligence
2. Evidence workflow: upload, AI image analysis, verifier review
3. WhatsApp field-reporting interface
4. Final visual polish on explore, project, and passport pages

## Stack

Next.js 14 (App Router), TypeScript, Prisma/Postgres (Supabase), NextAuth, Resend, wagmi with RainbowKit and Reown, Brickken sandbox API (Sepolia), Groq (openai/gpt-oss-20b) for the Impact Agent

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. `npm install`
3. `npm run db:push`
4. `npm run dev`

## A note on the AI model

Imvecto's AI layer was originally scoped around Meta Llama. Meta shifted its flagship model to Muse Spark in April 2026, and major inference providers no longer host general-purpose open Llama chat models. The Impact Agent now runs on Groq (openai/gpt-oss-20b), chosen for free hosting and reliable tool calling, while keeping the same agent architecture so swapping models later is a small change.

## Verified transactions (Sepolia)

- SOLA tokenization: `0x2020cae5109b08725d2b719fce7b632c603fa43659917a8492bc68922bfbc337`
- SOLA STO: `0xe5482213e9c728210915862a0d29fb752210dd7dad910c96c29896b36175391c`
- Investor whitelist (tokenizer-signed, server-side): confirmed working
- Investment (newInvest): `0x80429aab5a358142a8ece8c8e5bc2cbc777638115755fc78596ea4710c7c7ebf`
- Investment (newInvest, second run): `0x3c3aca84...befe742a` (full hash available in-app via the confirmation screen's copy button)
