# 🏠 Rentus — Frontend

> Modern rental management platform built with Vue 3, TypeScript, Vite, and Pinia.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Backend API | Running on `VITE_API_URL` |

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/miguelcamilok/frontend-rentus.git
cd frontend-rentus

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API URL and Google Maps key

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📦 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g. `https://api.rentusco.com/api`) |
| `VITE_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps API key (restricted to your domain) |

See [`.env.example`](.env.example) for the full list.

---

## 🗂️ Project Structure

```
src/
├── admin/              # Admin panel (pages, components, routes, composables)
├── assets/             # Static assets (CSS, images)
├── components/         # Shared components (NavBar, Footer, modals, search)
├── composables/        # Vue composables (useProperties, useAlerts [legacy])
├── events/             # Event bus
├── i18n.ts             # Vue-i18n configuration
├── layouts/            # Page layouts (MainLayout, AuthLayout, AdminLayout)
├── locales/            # Translation files (es, en)
├── router/             # Vue Router configuration and guards
├── services/           # API service layer (auth, properties, maps, pdf, etc.)
├── stores/             # Pinia stores (alerts, property, user, notifications)
├── tests/              # Tests (unit, integration, e2e)
├── types/              # TypeScript interfaces (Property, User, etc.)
├── utils/              # Utilities (logger)
├── views/              # Page views (Home, Auth, Property, Map, Profile, etc.)
├── App.vue             # Root component
├── main.ts             # App entry point
└── style.css           # Global styles and design tokens
```

---

## 📜 Available Scripts

```bash
npm run dev             # Start Vite dev server
npm run build           # Type-check + production build
npm run preview         # Preview the production build locally
npm run type-check      # Run vue-tsc type checking
npm run test            # Run Vitest unit/integration tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run Playwright E2E tests
npm run lint            # Lint and auto-fix with ESLint
```

---

## 🧪 Testing

### Unit & Integration Tests (Vitest)

```bash
npm run test
```

Tests are in `src/tests/unit/` and `src/tests/integration/`.

### E2E Tests (Playwright)

```bash
# Start the dev server first
npm run dev

# In another terminal
npm run test:e2e
```

E2E tests are in `src/tests/e2e/`. Configure test credentials in `.env.test`.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| Build Tool | Vite 7 |
| State Management | Pinia |
| Routing | Vue Router 4 |
| HTTP Client | Axios (with interceptors for JWT refresh) |
| Maps | Leaflet |
| Charts | Chart.js + vue-chartjs |
| Icons | FontAwesome (SVG) + Heroicons |
| i18n | Vue-i18n |
| SEO | @unhead/vue (dynamic meta tags) |
| Testing | Vitest + Vue Test Utils + Playwright |

---

### Code Guidelines

- Use `@/` import alias for all paths
- Use the `logger` utility instead of `console.log` (auto-stripped in production)
- Use Pinia stores for shared state, not module-level `ref()` exports
- All catch blocks must type errors as `unknown` and narrow with `instanceof`
- Add `aria-label` to icon-only buttons for accessibility

---

## 📄 License

Proprietary — All rights reserved.
