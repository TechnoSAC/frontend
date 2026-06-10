workspace "FullTank Platform" "A fuel distribution management platform developed by TechnoSAC that connects fuel-requesting companies with fuel providers, automating the full order lifecycle from request to delivery." {

  model {

    # ══════════════════════════════════════════════
    # PERSONAS / ACTORES
    # ══════════════════════════════════════════════

    visitor = person "Visitor" "Anonymous user who navigates the FullTank landing page to learn about the platform and register." "Visitor"

    client = person "Client (Requester)" "Representative of a company that needs fuel. Browses providers and products, manages equipment, creates requests, registers payments, and confirms deliveries." "Client"

    provider = person "Provider" "Representative of a fuel distribution company. Manages inventory, approves or rejects orders, assigns fleet, and dispatches deliveries." "Provider"

    # ══════════════════════════════════════════════
    # SISTEMAS EXTERNOS
    # ══════════════════════════════════════════════

    emailService  = softwareSystem "Email Service"           "Sends password recovery emails to registered users." "External"
    cloudStorage  = softwareSystem "Cloud Storage"           "Stores payment voucher images uploaded by clients." "External"
    pdfService    = softwareSystem "PDF Generator Service"   "Generates downloadable PDF reports for sales and consumption summaries." "External"

    # ══════════════════════════════════════════════
    # SISTEMA PRINCIPAL: FULLTANK
    # ══════════════════════════════════════════════

    fullTank = softwareSystem "FullTank Platform" "Web-based fuel distribution management system built by TechnoSAC." {

      webApplication = container "Web Application" "Serves the FullTank SPA static assets to the browser upon request." "Nginx / Node.js" "WebBrowser"

      # ── LANDING PAGE ──────────────────────────
      landingPage = container "Landing Page" "Public-facing static website. Presents platform features, pricing plans, testimonials, FAQ, and contact form." "HTML, CSS, JavaScript" "WebBrowser" {
        homeSection       = component "Home Section"         "Hero section summarizing FullTank's value proposition for both clients and providers." "HTML/JS"
        aboutSection      = component "About Us Section"     "Presents the TechnoSAC team, mission, and values." "HTML/JS"
        howItWorksSection = component "How It Works Section" "Step-by-step explanation of the request-to-delivery flow." "HTML/JS"
        benefitsSection   = component "Benefits Section"     "Key advantages of adopting FullTank over traditional fuel procurement." "HTML/JS"
        clientsSection    = component "Clients Section"      "Testimonials from existing client and provider companies." "HTML/JS"
        pricingSection    = component "Pricing Section"      "Available subscription plans with call-to-action to register." "HTML/JS"
        contactSection    = component "Contact Section"      "Contact form and direct support information." "HTML/JS"
        faqSection        = component "FAQ Section"          "Frequently asked questions organized by category." "HTML/JS"
        languageSwitcher  = component "Language Switcher"    "Toggles the interface between Spanish and English." "HTML/JS"
      }

      # ── WEB APPLICATION (SPA) ─────────────────
      webApp = container "FullTank Web Application" "Single Page Application used by clients and providers to manage the full fuel order lifecycle." "TypeScript, Vue.js 3, Pinia" "Browser" {

        # Shared / Cross-cutting
        authModule           = component "Auth Module"             "Login, logout, and password recovery views. Manages JWT token in Pinia store and session state." "Vue Component"
        notificationPanel    = component "Notification Panel"      "In-app notification feed with unread badge counter." "Vue Component"
        profileModule        = component "Profile Module"          "View and edit authenticated user profile data." "Vue Component"
        httpClient           = component "HTTP Client (Axios)"     "Centralized Axios instance with JWT interceptor for all API calls." "Vue Plugin"
        routerGuard          = component "Router Guard (Vue Router)" "Protects authenticated routes and redirects by user role." "Vue Plugin"
        piniaStore           = component "Pinia Store"             "Global state: auth session, notifications, order lists, and UI state." "Vue Plugin"

        # Client-side modules
        clientDashboard      = component "Client Dashboard"        "KPI summary: pending, approved, dispatched, delivered, and rejected orders." "Vue Component"
        catalogModule        = component "Catalog Module"          "Browse available providers, view their product catalog, and add products to client equipment." "Vue Component"
        equipmentModule      = component "Equipment Module"        "Register, update, and delete client equipment (vehicles, generators, machines) with assigned fuel types." "Vue Component"
        requestModule        = component "Request Module"          "Create, view, filter, search, and cancel fuel requests." "Vue Component"
        paymentModule        = component "Payment Module"          "Register payment vouchers: bank, operation code, amount, and image upload." "Vue Component"
        clientReportModule   = component "Client Report Module"    "Monthly fuel consumption chart and downloadable PDF." "Vue Component"

        # Provider-side modules
        providerDashboard    = component "Provider Dashboard"      "KPI summary of all managed orders grouped by status." "Vue Component"
        orderModule          = component "Order Module"            "Approve, reject, dispatch, and close orders." "Vue Component"
        inventoryModule      = component "Inventory Module"        "Add and update fuel stock and price per liter by fuel type." "Vue Component"
        fleetModule          = component "Fleet Module"            "Register vehicles and drivers for dispatch assignment." "Vue Component"
        dispatchModule       = component "Dispatch Module"         "Assign available transport and driver to an approved order." "Vue Component"
        providerReportModule = component "Provider Report Module"  "Monthly sales chart and downloadable PDF sales report." "Vue Component"
        clientListModule     = component "Client List Module"      "List and detail view of requester companies and order history." "Vue Component"
      }

      # ── BACKEND API ───────────────────────────
      apiBackend = container "FullTank API" "RESTful backend that handles all business logic and domain rules, organized by Bounded Context." "C#, ASP.NET Core 8, Entity Framework Core" "Monolith" {

        identityBC     = component "Identity & Access BC"     "Handles user registration (client/provider), login, logout, JWT issuance, password recovery, and profile management. Exposes: POST /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/password-reset, GET /api/users/{id}, PUT /api/users/{id}." "ASP.NET Core"

        catalogBC      = component "Catalog BC"               "Client-facing bounded context. Allows clients to browse available providers, view their product offerings, and assign products to client equipment. Exposes: GET /api/catalog/providers, GET /api/catalog/providers/{id}/products, POST /api/catalog/equipment-assignments." "ASP.NET Core"

        equipmentBC    = component "Equipment BC"             "Manages client equipment (vehicles, generators, machines). Each equipment has an assigned fuel type, capacity, and status. Exposes: GET/POST /api/equipment, PUT /api/equipment/{id}, DELETE /api/equipment/{id}, PATCH /api/equipment/{id}/fuel-type." "ASP.NET Core"

        inventoryBC    = component "Inventory BC"             "Provider-facing bounded context. Manages fuel stock levels and price per liter by fuel type. Validates item information and notifies admin on updates. Exposes: GET/POST/PUT/DELETE /api/inventory." "ASP.NET Core"

        orderingBC     = component "Ordering BC"              "Orchestrates the full order lifecycle: create request, cancel, approve, reject, dispatch, confirm delivery, and close. Exposes: POST /api/requests, GET /api/requests, PATCH /api/requests/{id}/cancel, PATCH /api/orders/{id}/approve|reject|dispatch|confirm|close." "ASP.NET Core"

        paymentBC      = component "Payment BC"               "Registers payment vouchers and validates total amount to enable order approval. Exposes: POST /api/payments, GET /api/payments/{orderId}, PATCH /api/payments/{id}/approve." "ASP.NET Core"

        fulfillmentBC  = component "Fulfillment BC"           "Manages provider fleet (vehicles/transports and drivers), assigns them to approved orders, and releases resources on order closure. Exposes: POST/GET /api/transports, POST/GET /api/drivers, POST /api/dispatch, DELETE /api/dispatch/{id}." "ASP.NET Core"

        notificationBC = component "Notification BC"          "Creates in-app notifications on every order status change and marks them as read. Exposes: GET /api/notifications, PATCH /api/notifications/{id}/read." "ASP.NET Core"

        reportingBC    = component "Reporting & Analytics BC" "Aggregates closed order data into sales and consumption charts, and generates downloadable PDF reports. Exposes: GET /api/reports/sales, GET /api/reports/consumption, POST /api/reports/generate." "ASP.NET Core"

        # ── Relaciones entre BCs (backend) ──────
        orderingBC    -> paymentBC       "Verifies payment total before approving an order"
        orderingBC    -> fulfillmentBC   "Triggers fleet release when an order is closed"
        orderingBC    -> inventoryBC     "Triggers stock deduction when an order is closed"
        orderingBC    -> notificationBC  "Creates a notification on every order status change"
        orderingBC    -> reportingBC     "Feeds closed order data into reporting aggregates"
        paymentBC     -> inventoryBC     "Reads fuel price to validate total payment amount"
        catalogBC     -> inventoryBC     "Reads provider product catalog and stock availability"
        catalogBC     -> equipmentBC     "Validates equipment fuel type when assigning a product"
        equipmentBC   -> catalogBC       "Queries available fuel types from provider catalogs"

        # ── BCs → Sistemas externos ─────────────
        identityBC    -> emailService    "Sends password recovery email"          "REST API"
        paymentBC     -> cloudStorage    "Uploads voucher image and retrieves URL" "REST API"
        reportingBC   -> pdfService      "Requests PDF report file generation"     "REST API"
      }

      # ── BASE DE DATOS ──────────────────────────
      mysqlDB = container "MySQL Database" "Stores all relational domain data: users, clients, providers, requests, orders, payments, fleet, dispatch, inventory, equipment, notifications, reports, and contact messages." "MySQL 8" "Database"

      # ══════════════════════════════════════════
      # RELACIONES ENTRE CONTAINERS
      # ══════════════════════════════════════════

      landingPage    -> webApplication "Redirects user to the platform"            "HTTPS"
      webApplication -> webApp         "Serves SPA bundle to the browser"          "HTTPS"
      webApp         -> apiBackend     "Invokes all REST API endpoints via Axios"  "HTTPS/REST"
      apiBackend     -> mysqlDB        "Persists and queries all domain data via EF Core" "ADO.NET/EF Core"
      apiBackend     -> emailService   "Dispatches password recovery emails"        "REST API"
      apiBackend     -> cloudStorage   "Uploads and retrieves payment voucher images" "REST API"
      apiBackend     -> pdfService     "Generates and retrieves downloadable PDF reports" "REST API"

      # ══════════════════════════════════════════
      # RELACIONES WEB APP MODULES → HTTP CLIENT
      # ══════════════════════════════════════════

      authModule           -> httpClient "Uses centralized Axios instance"
      clientDashboard      -> httpClient "Uses centralized Axios instance"
      catalogModule        -> httpClient "Uses centralized Axios instance"
      equipmentModule      -> httpClient "Uses centralized Axios instance"
      requestModule        -> httpClient "Uses centralized Axios instance"
      paymentModule        -> httpClient "Uses centralized Axios instance"
      clientReportModule   -> httpClient "Uses centralized Axios instance"
      notificationPanel    -> httpClient "Uses centralized Axios instance"
      profileModule        -> httpClient "Uses centralized Axios instance"
      providerDashboard    -> httpClient "Uses centralized Axios instance"
      orderModule          -> httpClient "Uses centralized Axios instance"
      inventoryModule      -> httpClient "Uses centralized Axios instance"
      fleetModule          -> httpClient "Uses centralized Axios instance"
      dispatchModule       -> httpClient "Uses centralized Axios instance"
      providerReportModule -> httpClient "Uses centralized Axios instance"
      clientListModule     -> httpClient "Uses centralized Axios instance"

      # Cross-cutting internal dependencies
      routerGuard          -> piniaStore "Reads auth token and role to protect routes"
      authModule           -> piniaStore "Writes session state on login/logout"
      notificationPanel    -> piniaStore "Reads unread notification count"

      # ══════════════════════════════════════════
      # HTTP CLIENT → BACKEND BCs
      # ══════════════════════════════════════════

      httpClient -> identityBC     "POST /api/auth/register|login|logout|password-reset, GET/PUT /api/users/{id}"
      httpClient -> catalogBC      "GET /api/catalog/providers, GET /api/catalog/providers/{id}/products, POST /api/catalog/equipment-assignments"
      httpClient -> equipmentBC    "GET/POST /api/equipment, PUT/DELETE /api/equipment/{id}, PATCH /api/equipment/{id}/fuel-type"
      httpClient -> inventoryBC    "GET/POST/PUT/DELETE /api/inventory"
      httpClient -> orderingBC     "POST /api/requests, GET /api/requests, PATCH /api/requests/{id}/cancel, PATCH /api/orders/{id}/approve|reject|dispatch|confirm|close"
      httpClient -> paymentBC      "POST /api/payments, GET /api/payments/{orderId}, PATCH /api/payments/{id}/approve"
      httpClient -> fulfillmentBC  "POST/GET /api/transports, POST/GET /api/drivers, POST /api/dispatch"
      httpClient -> notificationBC "GET /api/notifications, PATCH /api/notifications/{id}/read"
      httpClient -> reportingBC    "GET /api/reports/sales|consumption, POST /api/reports/generate"
    }

    # ══════════════════════════════════════════════
    # RELACIONES EXTERNAS (Personas → Sistema)
    # ══════════════════════════════════════════════

    visitor  -> landingPage "Explores platform features and navigates to registration" "HTTPS"
    client   -> landingPage "Accesses the platform through the landing page"           "HTTPS"
    provider -> landingPage "Accesses the platform through the landing page"           "HTTPS"

    visitor  -> fullTank "Browses public landing page"
    client   -> fullTank "Manages fuel requests, browses catalog, and manages equipment"
    provider -> fullTank "Manages fuel distribution operations and inventory"
  }

  # ══════════════════════════════════════════════════════
  # VIEWS
  # ══════════════════════════════════════════════════════

  views {

    systemContext fullTank "SystemContext" "System Context — FullTank by TechnoSAC." {
      include *
      autoLayout
    }

    container fullTank "Containers" "Container diagram — internal architecture of FullTank." {
      include *
      autoLayout
    }

    component webApp "WebAppComponents" "Components — FullTank Web Application (Vue.js 3 SPA with Pinia and Vue Router)." {
      include *
      autoLayout
    }

    component apiBackend "BackendComponents" "Components — FullTank API organized by Bounded Context (ASP.NET Core 8)." {
      include *
      autoLayout
    }

    component landingPage "LandingComponents" "Components — FullTank Landing Page." {
      include *
      autoLayout
    }

    styles {

      element "Person" {
        shape Person
        background "#ffffff"
        color "#0f4c81"
        stroke "#0f4c81"
        fontSize 20
      }

      element "Software System" {
        background "#ffffff"
        color "#0f4c81"
        stroke "#0f4c81"
        shape RoundedBox
        fontSize 20
      }

      element "External" {
        background "#6b7280"
        color "#ffffff"
        stroke "#6b7280"
        shape RoundedBox
      }

      element "Visitor" {
        background "#9ca3af"
        stroke "#9ca3af"
        color "#ffffff"
      }

      element "Client" {
        background "#2563eb"
        stroke "#2563eb"
        color "#ffffff"
      }

      element "Provider" {
        background "#16a34a"
        stroke "#16a34a"
        color "#ffffff"
      }

      element "WebBrowser" {
        shape WebBrowser
        background "#ffffff"
        color "#0f4c81"
        stroke "#0f4c81"
      }

      element "Browser" {
        shape WebBrowser
        background "#eff6ff"
        color "#1d4ed8"
        stroke "#1d4ed8"
      }

      element "Monolith" {
        shape RoundedBox
        background "#f0fdf4"
        color "#15803d"
        stroke "#15803d"
      }

      element "Database" {
        shape Cylinder
        background "#e0f2fe"
        color "#0369a1"
        stroke "#0369a1"
      }
    }
  }
}
