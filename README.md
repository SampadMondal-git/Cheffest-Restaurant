# Restaurant Landing Page

> A full-stack restaurant experience for discovering dishes, reserving a table, placing orders, and running the day-to-day operation behind the scenes.

<p align="center">
  <strong>Beautiful on the table. Practical behind the counter.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> &nbsp; | &nbsp;
  <a href="#features">Features</a> &nbsp; | &nbsp;
  <a href="#architecture">Architecture</a> &nbsp; | &nbsp;
  <a href="#api-surface">API surface</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## The idea

This is more than a restaurant landing page. It is a connected dining workspace:

- **Guests** can browse the menu, filter dishes, read reviews, reserve tables, contact the restaurant, and place orders.
- **Authenticated customers** can manage their profile, review their orders, and view reservations.
- **Staff and administrators** get focused dashboards for items, orders, reservations, users, messages, and revenue.
- **The API** keeps authentication, role checks, rate limiting, uploads, email, and persistence in one server application.

The interface uses a warm food-first visual language, responsive layouts, lazy-loaded screens, optimistic updates, and lightweight loading states that keep the experience moving while data arrives.

## Features

### Guest experience

- Responsive home, about, menu, contact, and reservation pages
- Complete dish catalogue at `/our-menu`
- Search by dish name and tags
- Filter by category and dietary type
- Dish detail modal with images, availability, ratings, and reviews
- Add-to-cart flow with a persistent cart context
- Reservation and contact forms
- Password recovery and reset flow

### Customer experience

- Signup, login, logout, and token restoration
- Profile view and profile updates
- Cart and order creation
- Order history and order confirmation
- Reservation history and reservation details
- Review submission for menu items
- Feedback and contact messaging

### Operations workspace

- Admin dashboard overview
- Menu item creation, editing, deletion, availability management, and image uploads
- Order management for kitchen and cashier workflows
- Reservation management
- User management
- Revenue dashboard and analytics
- Head chef and cashier-specific screens
- Role-aware access control enforced by the API

### Performance and resilience

- Route-level lazy loading with React `Suspense`
- Shared item request caching to avoid duplicate menu requests
- Cache invalidation after item mutations
- Lean, field-selected item queries on the server
- Lazy-loaded menu images with asynchronous decoding
- Skeleton loading for the full menu instead of a blocking blank state
- API rate limiting for general, auth, review, and feedback traffic
- JWT accepted through an authorization header or secure cookie

## Tech stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Client | React 19 + TypeScript | Component-based application UI |
| Build | Vite 7 | Development server and production bundling |
| Styling | Tailwind CSS 4 + CSS | Responsive visual system |
| Icons | Lucide React | Consistent interface icons |
| Client routing | React Router 7 | Public, customer, and staff routes |
| HTTP | Axios | API requests and auth headers |
| Server | Express 5 | REST API and middleware pipeline |
| Database | MongoDB + Mongoose | Users, items, orders, reservations, and reviews |
| Authentication | JWT + bcrypt | Session identity and password security |
| Media | Cloudinary | Menu image storage and delivery |
| Email | Nodemailer | Password recovery and transactional mail |
| Uploads | Multer | Multipart image handling |

## Project structure

```text
.
├── backend/
│   ├── config/          Environment and Cloudinary configuration
│   ├── controllers/     Request handlers and business workflows
│   ├── db/              MongoDB connection
│   ├── middleware/      Auth, role, upload, and rate-limit middleware
│   ├── model/           Mongoose schemas
│   ├── routes/          REST route modules
│   ├── services/        Email and revenue services
│   ├── templates/       Email templates
│   └── server.js        Express application entry point
├── frontend/
│   ├── api/             Axios services for each API domain
│   ├── components/      Shared UI and feature components
│   ├── pages/           Route-level screens
│   ├── public/           Public static files
│   ├── src/
│   │   ├── contexts/    Auth, cart, and confirmation state
│   │   ├── assets/      Images and visual assets
│   │   └── App.tsx      Router and application providers
│   └── vite.config.ts   Vite and Tailwind configuration
└── README.md
```

## Requirements

- Node.js 20 or newer recommended
- npm 10 or newer recommended
- A MongoDB database or MongoDB Atlas cluster
- A Cloudinary account for menu images
- SMTP credentials for password-reset email

## Quick start

### 1. Install dependencies

Open two terminals from the repository root:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Configure the backend

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGO_DB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET_KEY=replace-with-a-long-random-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

EMAIL_USER=you@example.com
EMAIL_PASS=your-smtp-password
WEBSITE_NAME=Your Restaurant
```

Never commit this file. The server loads it automatically from `backend/.env`.

### 3. Configure the frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is used as the Axios base URL for every client request.

### 4. Start the applications

Terminal 1, API server:

```bash
cd backend
npm start
```

The API runs on `http://localhost:5000` by default.

Terminal 2, web application:

```bash
cd frontend
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

## Available scripts

### Frontend

```bash
npm run dev       # Start Vite in development mode
npm run build     # Type-check and create the production bundle
npm run lint      # Run ESLint
npm run preview   # Preview the production bundle locally
```

### Backend

```bash
npm start         # Start the Express server
npm test          # Run Node's test runner
```

## API surface

The server mounts these route groups from `backend/server.js`:

| Base path | Responsibility |
| --- | --- |
| `/signup`, `/login`, `/logout` | Authentication and account recovery |
| `/items` | Public menu reads and protected item management |
| `/reviews` | Item reviews and review moderation |
| `/feedback` | Customer feedback |
| `/reservation` | Table reservations |
| `/order` | Cart checkout and order workflows |
| `/user` | User administration and user details |
| `/contact` | Contact messages |
| `/cart` | Cart persistence |
| `/revenue` | Revenue and dashboard analytics |

The public menu read endpoint is:

```text
GET /items/get-all-items
```

The frontend sends credentials with requests and attaches a stored JWT as a bearer token when one is available. The backend also supports the `jwt` cookie for protected requests.

## Main frontend routes

| Route | Screen |
| --- | --- |
| `/` | Home |
| `/about` | Restaurant story and facilities |
| `/menu` | Featured menu experience |
| `/our-menu` | Full searchable menu |
| `/reservation` | Reservation form |
| `/contact` | Contact form |
| `/signup` | Account creation |
| `/login` | Sign in |
| `/profile` | Customer profile |
| `/orders` | Customer orders |
| `/reservations` | Customer reservations |
| `/dashboard` | Admin dashboard |
| `/manage-items` | Menu management |
| `/manage-orders` | Order management |
| `/manage-reservations` | Reservation management |
| `/users` | User management |
| `/messages` | Contact and feedback messages |
| `/revenue-dashboard` | Revenue analytics |
| `/cashier-dashboard` | Cashier workspace |
| `/headchef-dashboard` | Head chef workspace |

## Authentication and roles

The application supports public guests, authenticated customers, and staff roles. The backend normalizes cashier access from a staff user's `position` field and protects sensitive routes with JWT and role middleware.

When testing protected flows locally:

1. Create an account from `/signup`.
2. Use the login page to establish a session.
3. Seed or promote staff accounts directly in the database when testing dashboards.
4. Keep production secrets and privileged account creation outside the client application.

## Testing and verification

Run the frontend checks before opening a pull request:

```bash
cd frontend
npm run lint
npm run build
```

Run backend tests with:

```bash
cd backend
npm test
```

The current backend test suite includes revenue service coverage. API integration tests can be added around authentication, menu management, orders, and reservations as those contracts evolve.

## Deployment notes

### Frontend

The frontend is Vercel-ready through `frontend/vercel.json`, which rewrites application paths to `index.html` for client-side routing.

Build it with:

```bash
cd frontend
npm run build
```

Set this production environment variable in the hosting provider:

```env
VITE_API_URL=https://your-api-domain.example.com
```

### Backend

Deploy the `backend` directory as a Node.js service and set all variables from the backend configuration section. Make sure:

- `FRONTEND_URL` exactly matches the deployed frontend origin.
- MongoDB Network Access allows the server to connect.
- Cloudinary credentials are present before item uploads are used.
- `NODE_ENV=production` is set so secure auth cookies are enabled.
- HTTPS is enabled in production.

## Contribution guide

1. Create a focused branch for the change.
2. Keep API services, route components, and shared contexts in their existing domains.
3. Update this README when routes, environment variables, or setup steps change.
4. Run frontend lint/build and backend tests before committing.
5. Avoid committing `.env` files, build output, credentials, or uploaded media.

## Security checklist

- Use a long, unique `JWT_SECRET_KEY`.
- Keep MongoDB, Cloudinary, SMTP, and JWT credentials server-side.
- Restrict `FRONTEND_URL` to trusted origins in production.
- Review role middleware whenever a new dashboard route is added.
- Keep rate limits enabled for authentication and user-generated content endpoints.
- Rotate credentials immediately if an environment file is exposed.

## License

This project currently uses the backend package's ISC license metadata. Add a dedicated repository license file before distributing the project publicly.

---

<p align="center">
  Built for a restaurant that wants its front of house and back of house to feel like one place.
</p>
