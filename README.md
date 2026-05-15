# FullTank — Fuel Order Management Platform

Web application for managing fuel delivery orders between transport companies and fuel providers.  
Built with **Vue 3**, **Vite**, **PrimeVue 4**, **Pinia**, **Vue Router 5**, and **Vue I18n 11**.

---

## Tech Stack

| Layer          | Technology                                   |
|----------------|----------------------------------------------|
| Framework      | Vue 3 (`<script setup>` SFCs)                |
| Build Tool     | Vite 8                                       |
| UI Library     | PrimeVue 4 + PrimeFlex 4 + PrimeIcons 7      |
| Theme          | Custom FullTank preset (Material base)       |
| State          | Pinia 3                                      |
| Routing        | Vue Router 5                                 |
| i18n           | Vue I18n 11 (EN / ES)                        |
| Charts         | Chart.js 4                                   |
| Mock API       | json-server                                  |
| HTTP Client    | Axios 1                                      |

---

## Project Structure

```
src/
├── dashboard/            # Dashboard BC
│   └── presentation/     # Routes + views
├── inventory/            # Product inventory BC
│   ├── domain/model/
│   ├── application/      # Pinia store
│   ├── infrastructure/   # API adapter + assembler
│   └── presentation/     # Routes + views
├── ordering/             # Fuel request ordering BC
│   ├── domain/model/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── fulfillment/          # Fleet and driver management BC
│   ├── domain/model/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── reporting/            # Reporting BC
│   └── presentation/
├── shared/               # Cross-cutting infrastructure and layout
│   ├── infrastructure/   # BaseApi, BaseEndpoint
│   └── presentation/     # Layout, LanguageSwitcher, Footer, views
├── locales/
│   ├── en.json
│   └── es.json
├── router.js
├── pinia.js
├── i18n.js
├── style.css
└── main.js

server/
├── db.json               # json-server mock database
└── routes.json           # API prefix rewrite rules (/api/v1/* → /*)
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

Running the full application requires **two terminals** open simultaneously.

```bash
# Terminal 1 — Mock API (json-server on port 3000)
cd server
npm start

# Terminal 2 — Frontend (Vite dev server on port 5173)
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Service URLs

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend       | http://localhost:5173            |
| Mock API       | http://localhost:3000            |
| API Base Path  | http://localhost:3000/api/v1/    |

---

## Environment Variables

Defined in `.env.development` and `.env.production`.

| Variable                        | Dev Value               | Purpose                        |
|---------------------------------|-------------------------|--------------------------------|
| `VITE_FULLTANK_API_URL`         | `http://localhost:3000` | Base URL for Axios             |
| `VITE_REQUESTS_ENDPOINT_PATH`   | `/requests`             | Ordering endpoint              |
| `VITE_CATALOG_ENDPOINT_PATH`    | `/catalog`              | Inventory/catalog endpoint     |
| `VITE_VEHICLES_ENDPOINT_PATH`   | `/vehicles`             | Fulfillment — vehicle fleet    |
| `VITE_DRIVERS_ENDPOINT_PATH`    | `/drivers`              | Fulfillment — driver registry  |

---

## Available Modules

| Route                       | Module                          | Status        |
|-----------------------------|---------------------------------|---------------|
| `/dashboard`                | Main dashboard                  | Implemented   |
| `/inventory/products`       | Product inventory (CRUD)        | Implemented   |
| `/ordering/pending`         | Provider — pending requests     | Implemented   |
| `/ordering/pending/:id`     | Order detail                    | Implemented   |
| `/ordering/requests`        | Client — my requests            | Implemented   |
| `/fulfillment/vehicles`     | Vehicle fleet (CRUD)            | Implemented   |
| `/fulfillment/drivers`      | Driver registry (CRUD)          | Implemented   |
| `/reporting`                | Reports and analytics           | In progress   |
| `/payment`                  | Payment management              | Pending       |
| `/iam`                      | Authentication and roles        | Pending       |

---

## Internationalization (i18n)

The UI is fully internationalized in English and Spanish.  
A language switcher is available in the top navigation bar (EN / ES).  
Locale files are located at `src/locales/en.json` and `src/locales/es.json`.

---

## Architecture

The project follows **Domain-Driven Design (DDD)** principles organized around bounded contexts.  
Each bounded context is self-contained and follows the layered structure:

```
domain → application → infrastructure → presentation
```

Shared infrastructure (`BaseApi`, `BaseEndpoint`) provides a common Axios gateway
configured through environment variables, keeping each BC decoupled from HTTP implementation details.

---

## Deployment

The project is configured for **Firebase Hosting** via `firebase.json` and `.firebaserc`.

```bash
# Build and deploy
npm run build
firebase deploy
```
