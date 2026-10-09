# Yummy

Web client for Yummy, a food-service social app. People browse restaurant pages and posts, follow places, and message people or pages. Page owners manage a menu, reviews, and insights. Admins review posts, verification requests, and reports.

This app talks to the Yummy API. Run that server first and point `VITE_API_URL` at it.

## Features

- Home feed, explore, tag pages, and search
- Discover pages by category, nearby location, and whether they are open
- Restaurant pages with posts, a structured menu, reviews, and open or closed hours
- Create and edit your own pages and posts
- Likes, comments, saves, and named save collections
- Dietary preferences on your profile, used by the For You feed
- Notifications, including preferences and older history
- Private messages with people and pages, including replies as yourself or as a page
- Live messages, typing, presence, reactions, link previews, and search inside a thread
- Inbox tools to pin, mute, hide, block, report, mark read, and delete chats
- Share a post, menu item, or page into a conversation
- Page quick replies for hours, address, and phone
- Active sessions, with sign-out for other devices
- Admin screens for post review, page verification, and reports

## Stack

| Tool | Role |
| --- | --- |
| React 19 | Interface |
| TypeScript | Types |
| Vite 7 | Dev server and production build |
| Tailwind CSS 4 | Styling |
| React Router 7 | Routes |
| TanStack Query | Server data |
| Zustand | Signed-in user |
| Axios | HTTP client |
| React Hook Form and Zod | Forms |
| Socket.IO client | Live messages |
| Framer Motion | Motion |

## Requirements

- Node.js 20 or newer
- The Yummy API running and reachable from the browser

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in this directory:

```bash
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is the API origin only. Request paths already include `/api`.

The API allows one browser origin, set there as `CLIENT_URL`. Use the same host you open in the browser. If you open the app at `http://localhost:5173`, `CLIENT_URL` must be that origin.

Start the app:

```bash
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`. The dev server listens on the network as well.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and build `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Origin of the Yummy API, for example `http://localhost:5000` |

## Routes

| Path | Who can open it | Screen |
| --- | --- | --- |
| `/` | Anyone | Home |
| `/login` | Guests | Log in |
| `/register` | Guests | Create an account |
| `/search` | Anyone | Search |
| `/discover` | Anyone | Discover pages |
| `/pages/:slug` | Anyone | A restaurant page |
| `/posts/:id` | Anyone | A post |
| `/tags/:tag` | Anyone | Posts for a tag |
| `/pages` | Signed in | Your pages |
| `/pages/create` | Signed in | Create a page |
| `/pages/:slug/edit` | Signed in | Edit a page |
| `/pages/:slug/insights` | Signed in | Page insights |
| `/posts/create` | Signed in | Create a post |
| `/posts/:id/edit` | Signed in | Edit a post |
| `/my-posts` | Signed in | Your posts |
| `/saved` | Signed in | Saved posts |
| `/notifications` | Signed in | Notifications |
| `/messages` | Signed in | Inbox |
| `/messages/:conversationId` | Signed in | One conversation |
| `/profile` | Signed in | Profile |
| `/profile/edit` | Signed in | Edit profile |
| `/profile/change-password` | Signed in | Change password |
| `/profile/sessions` | Signed in | Devices |
| `/admin/post-reviews` | Admin | Review posts |
| `/admin/page-verifications` | Admin | Review page verification |
| `/admin/reports` | Admin | Review reports |

## Project layout

```text
src/
├── main.tsx              App entry
├── api/                  Axios client and endpoint paths
├── routes/               Router
├── pages/                Route entry components
├── components/           Shared layout and controls
├── context/              Auth and create modals
├── features/             Product areas
│   ├── auth/
│   ├── comments/
│   ├── feed/
│   ├── home/
│   ├── messages/
│   ├── notifications/
│   ├── pages/
│   ├── posts/
│   ├── profile/
│   ├── reports/
│   ├── saved/
│   ├── search/
│   ├── sessions/
│   └── user/
├── hooks/
├── store/                Auth store
├── types/
└── utils/
```

Each feature keeps its own pages, components, hooks, services, and types. `@/` maps to `src/`.

## How sign-in works

Login and registration return an access token and the user. The access token is stored in `sessionStorage`. The API sets the refresh token as an `httpOnly` cookie.

On a full page load, the app calls `POST /api/token` once and restores the session from that cookie. If a later request returns 401, Axios refreshes the token and retries the request. Logout calls `POST /api/logout`, which clears the cookie, and the client drops the access token.

## Live messages

When someone is signed in, the app opens a Socket.IO connection to `VITE_API_URL` and sends the access token with the handshake. New messages, edits, read receipts, typing, and presence update the open inbox without a full reload. After a reconnect, the message queries are refreshed.
