# FullTank — Fuel Order Management Platform

Web application for managing fuel delivery orders between transport companies and fuel providers.  
Built with **Vue 3** · **Vite** · **PrimeVue** · **Pinia** · **Vue Router** · **Vue I18n**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (`<script setup>` SFCs) |
| Build tool | Vite |
| UI Library | PrimeVue 4 + PrimeFlex + PrimeIcons |
| Theme | Custom FullTank preset (Material base) |
| State | Pinia |
| Routing | Vue Router 4 |
| i18n | Vue I18n (EN / ES) |
| Mock API | json-server |
| HTTP | Axios |

---

## Project Structure

```
src/
├── catalog/              # Product catalog BC
│   ├── domain/model/
│   ├── application/      # Pinia store
│   ├── infrastructure/   # API adapter + assembler
│   └── presentation/     # Routes + views
├── ordering/             # Fuel request ordering BC
│   ├── domain/model/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── fulfillment/          # Fleet & driver management BC
│   ├── domain/model/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── shared/               # Cross-cutting infrastructure & layout
│   ├── infrastructure/   # BaseApi, BaseEndpoint
│   └── presentation/     # Layout, LanguageSwitcher, Footer
├── locales/
│   ├── en.json
│   └── es.json
├── router.js
├── pinia.js
├── i18n.js
└── main.js

server/
├── db.json               # json-server mock database
└── routes.json           # API prefix rewrite rules (/api/v1/* → /*)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run (dev mode)

Requires **two terminals**:

```bash
# Terminal 1 — Mock API (json-server on :3000)
cd server
npm start

# Terminal 2 — Frontend (Vite on :5173)
npm run dev
```

### URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Mock API | http://localhost:3000 |
| API prefix | http://localhost:3000/api/v1/ |

---

## Environment Variables

| Variable | Dev value | Purpose |
|---|---|---|
| `VITE_FULLTANK_API_URL` | `http://localhost:3000` | Base URL for Axios |
| `VITE_REQUESTS_ENDPOINT_PATH` | `/requests` | Ordering endpoint |
| `VITE_CATALOG_ENDPOINT_PATH` | `/catalog` | Catalog endpoint |
| `VITE_VEHICLES_ENDPOINT_PATH` | `/vehicles` | Fulfillment — fleet |
| `VITE_DRIVERS_ENDPOINT_PATH` | `/drivers` | Fulfillment — drivers |

Config files: `.env.development` · `.env.production`

---

## Available Modules

| Route | Module | Status |
|---|---|---|
| `/catalog/products` | Product catalog (CRUD) |  Implemented |
| `/ordering/pending` | Provider — pending requests |  Implemented |
| `/ordering/pending/:id` | Order detail |  Implemented |
| `/ordering/requests` | Client — my requests |  Implemented |
| `/fulfillment/vehicles` | Vehicle fleet (CRUD) |  Implemented |
| `/fulfillment/drivers` | Driver registry (CRUD) |  Implemented |
| `/payment` | Payment management |  Pending |
| `/reporting` | Reports & analytics |  Pending |
| `/iam` | Auth & roles |  Pending |

---

## i18n

UI fully internationalized in English and Spanish.  
Language switcher available in the top bar (EN / ES).  
Locale files: `src/locales/en.json` · `src/locales/es.json`

---

## Architecture

Follows **Domain-Driven Design** bounded context structure.  
Each BC is self-contained: `domain → application → infrastructure → presentation`.  
Shared infrastructure (`BaseApi`, `BaseEndpoint`) provides a common Axios gateway driven by environment variables.