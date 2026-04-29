# MERN CRM

Full-stack CRM application with MongoDB, Express, React (Vite), and Node.js: JWT auth, contacts with notes, deals with kanban stages, and a dashboard with analytics.

## Demo credentials

Use these after the database has been seeded (automatic on first `npm run dev` with `USE_MEMORY_DB=1`, or run `npm run seed` against your MongoDB).

| | |
|--|--|
| **Email** | `demo@crm.local` |
| **Password** | `demo123456` |

Single source of truth: [`shared/demo-user.js`](shared/demo-user.js) (used by `server/seed.js` and the login UI). In **development**, the login page includes **Sign in as demo**. To show that panel in a production build, set `VITE_SHOW_DEMO_LOGIN=true` in `client/.env`.

## Repository

Published as **`mern-crm`** on GitHub: [https://github.com/Zayan-Noor/mern-crm](https://github.com/Zayan-Noor/mern-crm).

## Tech stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Node.js, Express, Mongoose, JWT (bcrypt)        |
| Frontend | React (Vite), Tailwind CSS, Recharts, hello-pangea/dnd, react-hot-toast |
| Database | In-memory MongoDB (dev), Atlas, **or** Docker/local MongoDB |

Monorepo layout:

- `server/` — API
- `client/` — SPA

## Prerequisites

- Node.js 18+
- Nothing else required for the default dev setup (database runs in RAM via `mongodb-memory-server`). The first `npm run dev` may download a MongoDB binary once (~600 MB).

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm run install-all
```

Or manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

**Easiest — zero Docker / zero Atlas**

Create defaults (skipped if files already exist):

```bash
npm run setup:local
```

This sets `USE_MEMORY_DB=1` in `server/.env`. Then run **`npm run dev`** — the API seeds demo data automatically on first start if the DB is empty.

**Docker MongoDB** (persistent local DB): after `npm run setup:local`, set `USE_MEMORY_DB=0` in `server/.env`, run `npm run docker:up`, then `npm run seed` once, then `npm run dev`.

**MongoDB Atlas**: set `USE_MEMORY_DB=0`, put your Atlas URI in `MONGO_URI`, set `JWT_SECRET`, then `npm run seed` and `npm run dev`.

**`client/.env`:**

```env
VITE_API_URL=http://localhost:5000
```

Adjust `VITE_API_URL` if the API runs on another host or port.

### 3. Run in development

From the **repository root**:

```bash
npm run dev
```

This starts:

- API: `http://localhost:5000` (or `PORT` from `server/.env`)
- Client: `http://localhost:5173`

Alternatively, run each side separately:

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Full demo reset when using a persistent MongoDB: `npm run seed`.

### 4. Create the GitHub repository (optional)

From the project root after `git init` and an initial commit:

```bash
gh repo create mern-crm --public --source=. --remote=origin --push
```

Use another name if `mern-crm` is taken; update the remote URL accordingly.

## API overview

**Public**

- `POST /api/auth/register` — body: `{ name, email, password }`
- `POST /api/auth/login` — body: `{ email, password }`

**Protected** (header: `Authorization: Bearer <JWT>`)

- `GET /api/auth/me` — returns current user (validates stored JWT)

- Contacts: `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/:id`, `POST /api/contacts/:id/notes`
- Deals: `GET/POST /api/deals`, `PUT/DELETE /api/deals/:id`
- Dashboard: `GET /api/dashboard/stats`

Health check: `GET /api/health`

## Frontend routes

| Route            | Description                                      |
|------------------|--------------------------------------------------|
| `/login`, `/register` | Auth forms                               |
| `/dashboard`     | KPI cards, deals-by-stage chart, recent contacts |
| `/contacts`      | Searchable/filterable table                      |
| `/contacts/:id`  | Detail, notes, linked deals, inline edit        |
| `/deals`         | Kanban by stage (drag-and-drop)                  |

JWT is stored in `localStorage` under `token`.

## Production build

```bash
cd client && npm run build
```

Serve the `client/dist` folder with any static host and point `VITE_API_URL` (build-time) at your deployed API.

## License

MIT
