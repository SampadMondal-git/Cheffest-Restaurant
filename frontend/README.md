# Restaurant Experience | Frontend

> The guest-facing restaurant experience and the role-aware operations workspace, built with React, TypeScript, Vite, and Tailwind CSS.

<p align="center">
	<img src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" alt="React 19" />
	<img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
	<img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
	<img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
</p>

## Experience at a glance

The frontend brings the restaurant together in one responsive application:

- A warm, image-led public website for discovering the restaurant and its menu
- Searchable and filterable menu browsing with item details and reviews
- Cart, checkout, reservation, contact, and feedback flows
- Customer accounts with profiles, orders, reservations, and password recovery
- Admin, cashier, head chef, and management workspaces
- Route-level lazy loading, cached menu requests, image lazy loading, and skeleton states

## Technology

| Area | Choice |
| --- | --- |
| UI | React 19 with TypeScript |
| Bundling | Vite 7 |
| Styling | Tailwind CSS 4 and component CSS |
| Routing | React Router 7 |
| API requests | Axios |
| Icons | Lucide React |
| Shared state | React Context |
| Hosting | Vercel-ready with `vercel.json` |

## Project structure

```text
frontend/
├── api/
│   ├── apiClient.ts       Axios instance and auth header handling
│   ├── authService.ts     Login, signup, logout, and recovery
│   ├── manageItems.ts     Menu reads and item mutations
│   ├── cart.ts             Cart API operations
│   ├── manageOrder.ts     Order workflows
│   ├── manageReservation.ts Reservation workflows
│   ├── manageUser.ts      Profile and user operations
│   ├── review.ts          Review operations
│   └── revenue.ts         Revenue dashboard requests
├── components/
│   ├── about/             About page sections
│   ├── contact/           Contact form
│   ├── dashboard/         Admin and staff tools
│   ├── global/            Navbar, footer, loaders, modals, confirmations
│   ├── home/              Home page sections
│   ├── kitchen/           Kitchen-facing workflows
│   ├── menu/              Featured and popular dishes
│   ├── reservation/       Reservation UI
│   └── user/              Customer profile, orders, and reservations
├── pages/                 Route-level screens
├── public/                Static public assets
├── src/
│   ├── assets/            Images and visual assets
│   ├── contexts/          Auth, cart, and confirmation providers
│   ├── App.tsx            Providers, lazy routes, and router
│   ├── App.css            Application styles
│   └── index.css          Global styles and Tailwind import
├── index.html
├── vite.config.ts
└── package.json
```

## Requirements

- Node.js 20 or newer recommended
- npm 10 or newer recommended
- A running backend API

The backend setup, MongoDB configuration, Cloudinary credentials, and server routes are documented in [backend/README.md](../backend/README.md).

## Local setup

Install dependencies from this directory:

```bash
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is passed to Axios as the API base URL. Vite only exposes variables prefixed with `VITE_` to browser code. Do not put secrets in this file.

Start the development server:

```bash
npm run dev
```

Vite normally serves the application at `http://localhost:5173`.

## Commands

```bash
npm run dev       # Start Vite with hot module replacement
npm run build     # Type-check and create the production bundle
npm run lint      # Run ESLint
npm run preview   # Serve the production bundle locally
```

The production build runs `tsc -b` before bundling, so type errors fail the build instead of reaching deployment.

## Application routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Restaurant home page |
| `/about` | Story, chef, facilities, and gallery |
| `/menu` | Featured menu experience |
| `/our-menu` | Complete menu with search and filters |
| `/reservation` | Create a table reservation |
| `/contact` | Send a contact message |
| `/signup` | Create a customer account |
| `/login` | Sign in |
| `/forgot-password` | Request a password reset |
| `/reset-password/:token` | Set a new password |

### Customer routes

| Route | Purpose |
| --- | --- |
| `/profile` | View and update customer details |
| `/orders` | View customer orders |
| `/reservations` | View customer reservations |
| `/reservations/:id` | View reservation details |
| `/order-confirmation` | Completed order state |
| `/booking-confirmation` | Completed booking state |
| `/feedback-confirmation` | Completed feedback state |

### Operations routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Main management dashboard |
| `/manage-items` | Create and manage menu items |
| `/manage-orders` | Process incoming orders |
| `/manage-reservations` | Manage reservations |
| `/users` | Manage users |
| `/messages` | Review contact and feedback messages |
| `/revenue-dashboard` | Revenue analytics |
| `/cashier-dashboard` | Cashier workspace |
| `/headchef-dashboard` | Head chef workspace |

Unknown paths are sent to the error page.

## Application architecture

`src/App.tsx` is the composition root. It provides the browser router and wraps the application with:

1. `AuthProvider` for session restoration, login state, and automatic token expiry handling
2. `ConfirmationProvider` for shared confirmation flows
3. `CartProvider` for cart state and cart actions
4. Global navigation, cart popup, confirmation modal, and footer
5. React `Suspense` for lazy-loaded route screens

### API layer

All HTTP requests should go through the service modules in `api/` rather than calling Axios directly from page components. `api/apiClient.ts`:

- Uses `VITE_API_URL` as the base URL
- Sends credentials for cookie-based sessions
- Reads the token from local or session storage
- Adds `Authorization: Bearer <token>` when a token exists

When adding a new backend domain, create or extend the matching service module and keep request/response shaping there.

### Shared state

Use the existing contexts for state that crosses route or component boundaries:

- `AuthContext`: current user, token, authentication status, login, signup, and logout
- `CartContext`: cart items and cart actions
- `ConfirmationContext`: application confirmation dialogs and actions

Keep short-lived form state and modal state inside the feature component that owns it.

## Performance patterns

The client already uses several patterns intended to keep navigation and menu browsing responsive:

- Route screens are imported with `React.lazy`.
- `Suspense` displays the shared loader while a route chunk is loading.
- Menu requests are shared and cached in `api/manageItems.ts`.
- Item mutations clear the menu cache so later reads remain fresh.
- Full-menu loading uses content-shaped skeletons instead of a blank page.
- Menu thumbnails use lazy loading and asynchronous image decoding.
- Expensive filtering and grouping are derived with `useMemo` where appropriate.

When adding a new image-heavy section, provide dimensions or stable aspect ratios and defer below-the-fold media.

## Styling and UI conventions

- Prefer existing Tailwind utilities and local component patterns.
- Use Lucide icons for interface actions.
- Keep interactive controls keyboard accessible and provide meaningful labels or titles.
- Preserve responsive behavior across mobile, tablet, and desktop layouts.
- Reuse the existing orange, neutral, and food-focused visual language unless a feature has a clear reason to differ.
- Keep API loading, empty, error, and success states visible and actionable.

## Deployment

The `vercel.json` rewrite sends application paths to `index.html`, allowing React Router routes to work on refresh.

Build for production:

```bash
npm run build
```

Configure the hosting provider with:

```env
VITE_API_URL=https://your-api-domain.example.com
```

The deployed backend must allow the frontend origin through `FRONTEND_URL` and CORS. See [backend/README.md](../backend/README.md) for server deployment requirements.

## Verification checklist

Before committing frontend changes:

```bash
npm run lint
npm run build
```

Also check the affected flow manually:

- Refresh the route directly, not only through navigation.
- Test the smallest supported viewport.
- Verify loading, empty, error, and success states.
- Confirm authenticated and logged-out behavior where relevant.
- Check that API errors do not leave stale loading indicators.

## Related documentation

- [Full project README](../README.md)
- [Backend README](../backend/README.md)
