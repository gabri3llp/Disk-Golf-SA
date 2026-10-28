# Disc Golf South Africa (DGSA)

A full-stack web application that promotes disc golf in South Africa. Visitors can browse upcoming tournaments, create an account, choose a Free or paid DGSA membership, and register players for events. Administrators review proof of payment, approve memberships, manage members, and create, edit and delete events.

**Module:** Interactive Development 200 (DV200)
**Student:** Gabriel Pulella (251298)

> **Demo project.** No real money is used or processed. Banking details and amounts shown in the payment steps are for demonstration only. Please do not make any real payment.

---

## Live deployments

| Platform | What it hosts | URL |
|---|---|---|
| **Platform 1: Azure Static Web Apps** | Frontend (React + Vite) | https://victorious-desert-0caf98b00.4.azurestaticapps.net |
| **Platform 2: AWS Amplify** | Frontend (React + Vite) | https://main.dukd5mhqsue22.amplifyapp.com |
| Shared API (Azure App Service) | Node/Express backend | dgsa-api-2026-fhhzg5a5grfvgudg.southafricanorth-01.azurewebsites.net |

Both frontends are built from this repository and call the same API and database.

> **Note:** the API runs on Azure's Free App Service plan, which sleeps when idle. If events don't load straight away, open the API link above once, wait up to a minute, then refresh either site.

---

## Design reference

The interface implements a design created by UX200 students. All layout, branding, imagery and interface components follow that design as closely as practical.

Deliberate differences from the design:
- The membership fee is shown as **R375** everywhere 
- A **demo notice** appears on the membership and payment screens.
- Event and dashboard details were extended where the design did not show them (for example, event editing and deleting, and the multi-player registration flow).
- An animated background and a mobile navbar layout were added.

---

## Features

**Public**
- Home page with tournament highlight, upcoming events carousel and FAQ accordion
- Login and sign-up
- Responsive layout designed for phones first 

**Players**
- Membership tiers: Free or DGSA Member (R375 per year, demo only)
- Three-step "Become a Member" form with proof-of-payment upload
- Event registration for one or several players, with a server-calculated price 
- Player dashboard: next event, my registrations, upcoming events

**Administrators**
- Live payment feed with approve, mark overdue and set-to-pending actions (approving a membership upgrades the user to DGSA)
- Member overview with active and inactive toggle, plus name search
- Tournament registrations table with a tournament filter and proof-of-payment links
- Create, edit and delete events, including poster upload

**Quality and SEO**
- Per-page titles, meta descriptions, canonical tags, `sitemap.xml` and `robots.txt`
- Google Analytics 4 page and event tracking
- WebP images, lazy loading, and an animated background that respects "reduce motion"

---

## Technologies used

| Area | Technology |
|---|---|
| Frontend | React, Vite, react-router-dom, axios, plain CSS (custom properties) |
| Backend | Node.js, Express 5, mysql2, bcryptjs, jsonwebtoken, multer, helmet, compression, cors, dotenv, express-validator |
| Database | MySQL (Azure Database for MySQL Flexible Server online; XAMPP/MariaDB locally) |
| File storage | Cloud blob storage through `Backend/storage.js`, with a local-disk fallback |
| Hosting | Azure Static Web Apps, AWS Amplify, Azure App Service |
| Tooling | Git and GitHub, GitHub Actions, VS Code, Azure CLI, phpMyAdmin |
| Analytics and SEO | Google Analytics 4, Google Search Console |

---

## Project structure

```
Disk Golf SA/
├── Backend/
│   ├── server.js            Express app: security, CORS, routes
│   ├── Database.js          MySQL connection pool (SSL optional)
│   ├── storage.js           File uploads (cloud storage or local fallback)
│   ├── schema.sql           Database schema and seed lookup data
│   ├── setupDatabase.js     Creates the first accounts and sample events
│   ├── importSql.js         Runs a .sql file against a remote database over SSL
│   ├── changePassword.js    Sets a new password for a user
│   ├── data/store.js        All SQL queries
│   ├── middleware/          auth.js (JWT, roles), upload.js (multer)
│   └── routes/              auth, events, members, registrations, admin
└── Frontend/
    ├── public/              Images (WebP), robots.txt, sitemap.xml, staticwebapp.config.json
    ├── .env.production      Public build settings (API address, analytics ID)
    └── src/
        ├── pages/           Home, Login, SignUp, MemberTier, BecomeMember,
        │                    EventRegister, NewEvent, Dashboard, AdminDashboard, PlayerDashboard
        ├── components/      Navbar, Footer, Faq, EventsCarousel, FileUpload, SuccessModal,
        │                    DashboardShell, AuthPhoto, AnimatedBackground, Seo, DemoNotice, ...
        ├── api.js           axios instance with token handling
