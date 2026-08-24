# Imvecto

**Fund Impact. Verify Progress. Prove Outcomes.**

Imvecto is an AI-powered trust infrastructure for real-world impact projects — combining Brickken-tokenized funding on Sepolia with an AI verification and monitoring layer. Built as one unified product for two submissions:

- **Build with Brickken hackathon** (deadline Sep 17, 2026)
- **AI Academy Nigeria Pitchathon** (deck submitted Aug 21, 2026)

## What's live

- Public browsing — home, explore, individual project pages, no login needed
- Email magic link sign-in (NextAuth + Resend HTTP API)
- Wallet connect (RainbowKit + wagmi, Sepolia)
- Project creation flow, admin verification screen
- Real, confirmed on-chain Brickken tokenization + STO for SOLA (Solar Power for 10 Rural Schools) — see transaction hashes below
- **Full funding flow, end to end and confirmed working**: connect wallet → whitelist → approve → invest, with a visible, copyable Sepolia Etherscan transaction link on the confirmation screen
- **Imvecto Impact Agent** — live AI agent with 7 tools (search_projects, get_project, get_project_progress, get_impact_passport, prepare_funding, get_milestones, request_evidence), confirmed working with real tool-calling. Rule: agent prepares, human approves, wallet signs — the agent never touches a wallet directly
- Impact Passport page + JSON export endpoint
- Passport-style hero and featured project card design
- Keyword-based icon matching for project cards (water, solar, education, health, etc.)
- Token symbol uniqueness validation on project creation

## What's next

1. Expand Impact Agent testing with more real prompts against live project data; consider a fallback model for resilience
2. AI project intelligence — summarization, Q&A, risk extraction
3. Evidence workflow — upload, AI image analysis, verifier review
4. WhatsApp field-reporting interface
5. Bring explore/project/passport pages to final visual polish

## Stack

Next.js 14 (App Router) · TypeScript · Prisma/Postgres (Supabase) · NextAuth · Resend · wagmi + RainbowKit + Reown · Brickken sandbox API (Sepolia) · Groq (openai/gpt-oss-20b) for the Impact Agent

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. `npm install`
3. `npm run db:push`
4. `npm run dev`

## A note on the AI model

Our Pitchathon deck framed Imvecto's AI layer around Meta Llama. Since submission, Meta shifted its flagship model to Muse Spark (April 2026), and major inference providers no longer host general-purpose open Llama chat models. Imvecto's Impact Agent now runs on Groq (openai/gpt-oss-20b) — chosen for genuinely free hosting and reliable tool-calling — while keeping the same agent architecture, so swapping models is a one-line change if that changes again.

## Verified transactions (Sepolia)

- SOLA tokenization: `0x2020cae5109b08725d2b719fce7b632c603fa43659917a8492bc68922bfbc337`
- SOLA STO: `0xe5482213e9c728210915862a0d29fb752210dd7dad910c96c29896b36175391c`
- Investor whitelist (tokenizer-signed, server-side): confirmed working, tokenizer-role transaction
- Investment (newInvest): `0x80429aab5a358142a8ece8c8e5bc2cbc777638115755fc78596ea4710c7c7ebf`
- Investment (newInvest, second confirmed run): `0x3c3aca84...befe742a` (full hash in-app via the confirmation screen's copy button)
