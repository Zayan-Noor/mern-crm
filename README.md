# MERN CRM

Full-stack CRM application with MongoDB, Express, React (Vite), and Node.js: JWT auth, contacts with notes, deals with kanban stages, and a dashboard with analytics.

## Repository

Published as **`mern-crm`** on GitHub: [https://github.com/Zayan-Noor/mern-crm](https://github.com/Zayan-Noor/mern-crm).

## Tech stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Node.js, Express, Mongoose, JWT (bcrypt)        |
| Frontend | React (Vite), Tailwind CSS, Recharts, hello-pangea/dnd, react-hot-toast |
| Database | MongoDB Atlas (connection string in `.env`)    |

Monorepo layout:

- `server/` — API
- `client/` — SPA

## Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB) and connection URI
- Git (optional: [GitHub CLI](https://cli.github.com/) (`gh`) to create the remote repo from the command line)

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

**`server/.env`** (copy from `server/.env.example`):

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/mern-crm?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-min-32-chars
PORT=5000
```

**`client/.env`** (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000
```

Adjust `VITE_API_URL` if the API runs on another host or port.

### 3. Seed sample data (optional)

With `MONGO_URI` set in `server/.env`:

```bash
cd server
npm run seed
```

Creates a demo user:

- Email: `demo@crm.local`
- Password: `demo123456`

Also inserts 10 contacts (mixed statuses) and 8 deals (mixed stages).

### 4. Run in development

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

### 5. Create the GitHub repository (optional)

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
