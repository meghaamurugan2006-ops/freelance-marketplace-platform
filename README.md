# Guildwork — Freelance Marketplace Platform

A centralized marketplace where clients post projects, freelancers bid on them,
and payment moves through a secure escrow — built to match the system proposed
in the project review (React, Node.js/Express, MongoDB, JWT, Socket.io).

The project has two parts:

```
freelance-marketplace-platform/
├── frontend/    → a working, click-through demo of every interface (open directly, no setup)
└── backend/     → a real Express + MongoDB + JWT + Socket.io API matching the system design
```

## 1. Frontend — the interfaces (open this first)

This is the part to show in your review. It is a complete, self-contained demo:
every screen — landing page, sign up/login, client and freelancer dashboards,
browse & bid, project details, messaging, escrow, and profile/ratings — is
fully clickable, using the browser's local storage to stand in for a database
so it works immediately with **no installation and no server**.

**To run it:** open `frontend/index.html` in any modern browser (Chrome, Edge,
Firefox). An internet connection is needed the first time, to load the page's
fonts and the React/Babel libraries from a CDN.

On the login screen, use **"View as demo client"** or **"View as demo
freelancer"** to explore instantly with realistic sample data already loaded
(open projects, an active escrow, a message thread, a completed project with a
review). You can also sign up as a new client or freelancer from scratch.

### What you can actually do in the demo
- Sign up / log in as a **client** or **freelancer**
- Client: post a project, review incoming proposals, accept one (which funds
  escrow), release funds once work is delivered, leave a review
- Freelancer: browse open projects, filter by skill, send a proposal, mark
  work as delivered, leave a review
- Both: message the other party on an active project, edit your profile

All data is stored in the browser's `localStorage`, under keys prefixed
`guildwork_`. To reset the demo to its original seed data, open the browser
console on the page and run `localStorage.clear()`, then refresh.

## 2. Backend — the API (matches the proposed system design)

`backend/` is a real Node.js service implementing the same data model and
flows as the frontend demo: signup/login with JWT, project CRUD, bidding,
accepting a bid (which opens an escrow record), delivering and releasing
escrow, per-project messaging (with Socket.io for live updates), and reviews.
It is not wired to the static frontend above (which needs no server at all)
— it's provided as the working reference implementation for the tech stack
named in the review (Node.js, Express.js, MongoDB, JWT, Socket.io).

**To run it:**

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI/JWT_SECRET if needed
npm start                 # or: npm run dev (with nodemon)
```

Requires a MongoDB instance reachable at `MONGO_URI` (a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster works fine). Once
running, the API is available at `http://localhost:5000/api` — start with
`GET /api/health` to confirm it's up. Key routes:

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login` | Create an account / log in (returns a JWT) |
| GET/POST | `/api/projects` | Browse open projects / post one (client) |
| POST | `/api/bids/project/:projectId` | Send a proposal (freelancer) |
| POST | `/api/bids/:bidId/accept` | Accept a proposal → funds escrow (client) |
| POST | `/api/escrow/project/:projectId/deliver` | Mark work delivered (freelancer) |
| POST | `/api/escrow/project/:projectId/release` | Release funds (client) |
| GET/POST | `/api/messages/project/:projectId` | Read / send project messages |
| POST | `/api/reviews/project/:projectId` | Leave a rating after completion |

## Notes for the review

- **Design direction:** the interface uses a "guild ledger" visual identity —
  ink/brass/teal palette, a serif display face (Fraunces) for headings paired
  with Work Sans for body text, ledger-style listing rows, and wax-seal-style
  status badges for Open / In progress / Escrow secured / Completed — a
  deliberate departure from generic dashboard templates.
- The frontend demo and backend API share the same data model (users,
  projects, bids, messages, escrow, reviews) so the backend can be connected
  to a new frontend build later (swap the `localStorage` calls in
  `frontend/index.html` for `fetch` calls against the API) without changing
  the underlying design.
