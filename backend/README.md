# Restaurant API

> The service layer behind the restaurant experience: authentication, menu management, orders, reservations, reviews, messaging, uploads, and revenue analytics.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-ESM-339933?logo=node.js&logoColor=white" alt="Node.js ESM" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB and Mongoose" />
  <img src="https://img.shields.io/badge/API-REST-E85D04" alt="REST API" />
</p>

## What this service does

The backend is an Express REST API backed by MongoDB. It provides the persistent workflows used by the restaurant website and staff dashboards:

- Account creation, login, logout, password recovery, and token validation
- Menu item reads, image uploads, editing, availability, and deletion
- Cart persistence and order workflows
- Table reservations and reservation management
- Reviews, feedback, and contact messages
- Customer profile and user administration
- Revenue reporting for operational dashboards
- JWT authentication, role checks, request rate limiting, and secure cookies

## Stack

- **Runtime:** Node.js with native ES modules
- **HTTP:** Express 5
- **Database:** MongoDB through Mongoose
- **Authentication:** JSON Web Tokens and bcrypt
- **Media:** Cloudinary and Multer
- **Email:** Nodemailer
- **Validation/utilities:** Validator, ExcelJS, PDFKit
- **Testing:** Node's built-in test runner

## Folder map

```text
backend/
├── config/
│   ├── cloudinary.js       Cloudinary client configuration
│   └── env.js              Loads backend/.env
├── controllers/            Request handlers and domain workflows
├── db/
│   └── database.js         MongoDB connection with retry handling
├── middleware/
│   ├── isAdmin.middleware.js
│   ├── rateLimit.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   └── verifyJWT.middleware.js
├── model/                  Mongoose schemas
├── routes/                 Express route modules
├── services/               Email and revenue services
├── templates/              Transactional email templates
├── utils/                  Token and order-number helpers
├── server.js               Application entry point
└── package.json
```

## Requirements

- Node.js 20 or newer recommended
- npm 10 or newer recommended
- MongoDB or MongoDB Atlas
- Cloudinary account for menu images
- SMTP credentials for password reset email

## Local setup

From the repository root:

```bash
cd backend
npm install
```

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

The environment loader reads this file automatically. Never commit it or expose its values to the frontend.

Start the API:

```bash
npm start
```

The server listens on `http://localhost:5000` unless `PORT` is changed. Its health-style root response is available at:

```text
GET /
```

## Scripts

```bash
npm start    # Start the API with Node
npm test     # Run Node's built-in test runner
```

For development with automatic restarts, use the repository's installed `nodemon` workflow if available:

```bash
npx nodemon ./server.js
```

## API route groups

The application mounts these route domains in `server.js`:

| Base path | Responsibility |
| --- | --- |
| `/signup` | Create an account |
| `/login` | Authenticate a user |
| `/logout` | End the current session |
| `/forgot-password` | Send a password reset email |
| `/reset-password/:token` | Set a new password |
| `/items` | Read and manage menu items |
| `/reviews` | Create and manage item reviews |
| `/feedback` | Receive customer feedback |
| `/reservation` | Create and manage table reservations |
| `/order` | Create and manage orders |
| `/user` | User details and administration |
| `/contact` | Contact messages |
| `/cart` | Cart persistence |
| `/revenue` | Revenue and operational analytics |

### Frequently used endpoints

```text
GET    /items/get-all-items
POST   /signup
POST   /login
POST   /logout
GET    /user-details
POST   /reservation/...
POST   /order/...
POST   /reviews/...
```

The exact child paths are defined in `backend/routes`. Keep route-specific changes inside their corresponding route and controller modules.

## Authentication

Protected requests may authenticate in either of these ways:

```http
Authorization: Bearer <jwt>
```

or with the `jwt` cookie set by the authentication flow.

The frontend sends credentials with Axios requests and also attaches a stored bearer token when one exists. The backend verifies the token with `JWT_SECRET_KEY` and places the decoded identity on `req.user`.

### Roles

The role middleware supports the application’s operational roles, including:

- `guest`
- regular authenticated users
- `admin`
- `staff`
- `cashier`, normalized from a staff member whose position is `cashier`

Use `verifyJWT` for identity-protected routes and the role middleware for permission-sensitive routes. Do not rely on frontend route hiding as an authorization boundary.

## Middleware pipeline

The server applies middleware in this order:

1. CORS validation against `localhost:5173` and `FRONTEND_URL`
2. JSON and URL-encoded body parsing
3. Cookie parsing
4. General rate limiting
5. Route-specific rate limits for reviews, feedback, and authentication flows
6. Route-level JWT, role, admin, and upload protection where required

Production deployments should use HTTPS so secure authentication cookies behave as intended.

## Data and media

### MongoDB

The API connects using `MONGO_DB_URI` and retries failed connections up to five times with increasing backoff. If startup fails, check:

- The connection string and database credentials
- MongoDB Atlas Network Access rules
- Cluster availability
- Local DNS/network access

### Cloudinary

Menu creation and updates accept multipart image uploads. The upload middleware limits the request to the configured item image count, then the controller stores Cloudinary URLs and public IDs with the item document.

### Email

Password recovery uses Nodemailer with `EMAIL_USER` and `EMAIL_PASS`. `WEBSITE_NAME` is used in the sender label and email templates.

## Testing

Run the test suite from this directory:

```bash
npm test
```

Run a single test file:

```bash
node --test services/revenue.service.test.js
```

Before submitting backend changes, verify:

- Protected routes reject missing or invalid tokens.
- Role-sensitive routes reject unauthorized roles.
- New database reads return only the fields the client needs.
- Upload and email failures return controlled API errors.
- Rate limits remain enabled for authentication and user-generated content.

## Production checklist

- Set `NODE_ENV=production`.
- Use a strong, unique `JWT_SECRET_KEY`.
- Set `FRONTEND_URL` to the exact deployed frontend origin.
- Deploy behind HTTPS.
- Restrict MongoDB Network Access to trusted server addresses.
- Keep Cloudinary and SMTP credentials in the host's secret manager.
- Configure logs and monitoring for startup, database, email, and upload failures.
- Do not commit `.env`, credentials, or generated files.

## Related documentation

- [Full project README](../README.md)
- [Frontend README](../frontend/README.md)
