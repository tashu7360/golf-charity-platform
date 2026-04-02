# ⛳ GolfGives — Golf Charity Subscription Platform

> Play golf. Change lives. Win prizes.

A full-stack subscription platform combining golf performance tracking, monthly prize draws, and charitable giving. Built with **React**, **Node.js/Express**, **MySQL**, and **Sequelize ORM**.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup — Step by Step](#setup--step-by-step)
5. [Environment Variables](#environment-variables)
6. [Stripe Setup](#stripe-setup)
7. [Running the App](#running-the-app)
8. [Seeding the Database](#seeding-the-database)
9. [Test Credentials](#test-credentials)
10. [API Reference](#api-reference)
11. [Feature Checklist](#feature-checklist)
12. [Deployment](#deployment)

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React 18, React Router v6, Axios     |
| Styling     | Custom CSS (no framework), Google Fonts |
| Backend     | Node.js, Express.js                  |
| ORM         | Sequelize v6                         |
| Database    | MySQL 8                              |
| Auth        | JWT (jsonwebtoken + bcryptjs)        |
| Payments    | Stripe Checkout + Webhooks           |
| File Upload | Multer                               |
| Email       | Nodemailer                           |
| Dev Tools   | Nodemon, dotenv                      |

---

## 📁 Project Structure

```
golf-charity-platform/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize MySQL connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile
│   │   ├── scoreController.js   # 5-score rolling logic
│   │   ├── charityController.js # Charity CRUD + donations
│   │   ├── drawController.js    # Draw engine (random + algorithmic)
│   │   ├── subscriptionController.js # Stripe checkout + webhooks
│   │   ├── winnerController.js  # Proof upload + verification
│   │   └── adminController.js   # Analytics + user management
│   ├── middleware/
│   │   ├── auth.js              # JWT protect, role guard, subscription guard
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── index.js             # All associations
│   │   ├── User.js
│   │   ├── Score.js
│   │   ├── Charity.js
│   │   ├── Draw.js
│   │   ├── DrawEntry.js         # DrawEntry + Winner models
│   │   └── Payment.js           # Payment + CharityDonation models
│   ├── routes/
│   │   ├── auth.js
│   │   ├── scores.js
│   │   ├── charities.js
│   │   ├── draws.js
│   │   ├── subscriptions.js
│   │   ├── winners.js
│   │   └── admin.js
│   ├── seeders/
│   │   └── seed.js              # Full database seed with sample data
│   ├── uploads/                 # Auto-created for file uploads
│   ├── server.js                # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── Navbar.js + Navbar.css
    │   │       └── ProtectedRoute.js
    │   ├── context/
    │   │   └── AuthContext.js   # Global auth state
    │   ├── pages/
    │   │   ├── Home.js + Home.css
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Auth.css
    │   │   ├── Pricing.js + Pricing.css
    │   │   ├── Dashboard.js + Dashboard.css
    │   │   ├── Scores.js + Scores.css
    │   │   ├── Charities.js + Charities.css
    │   │   ├── Draws.js + Draws.css
    │   │   ├── Admin.js + Admin.css
    │   │   └── HowItWorks.js
    │   ├── styles/
    │   │   └── global.css       # Full design system
    │   ├── utils/
    │   │   └── api.js           # Axios instance with JWT interceptors
    │   ├── App.js               # All routes
    │   └── index.js
    ├── package.json
    └── .env.example
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine before starting:

| Tool       | Version  | Download                        |
|------------|----------|---------------------------------|
| Node.js    | v18+     | https://nodejs.org              |
| npm        | v9+      | Comes with Node.js              |
| MySQL      | v8+      | https://dev.mysql.com/downloads |
| Git        | any      | https://git-scm.com             |

---

## 🚀 Setup — Step by Step

### Step 1 — Clone or unzip the project

If you received a ZIP file:
```bash
unzip golf-charity-platform.zip
cd golf-charity-platform
```

If from Git:
```bash
git clone <repo-url>
cd golf-charity-platform
```

---

### Step 2 — Create the MySQL database

Open your MySQL client (MySQL Workbench, TablePlus, or terminal) and run:

```sql
CREATE DATABASE golf_charity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> ⚠️ The app uses Sequelize `sync` to create all tables automatically — you only need to create the empty database.

---

### Step 3 — Set up the backend

```bash
cd backend
cp .env.example .env
npm install
```

Now open `backend/.env` and fill in your values (see [Environment Variables](#environment-variables) section).

---

### Step 4 — Set up the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
```

Open `frontend/.env` and fill in:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

### Step 5 — Seed the database (optional but recommended)

From the `backend/` folder:

```bash
npm run seed
```

This will:
- Create all tables fresh (drops existing data)
- Create 1 admin user
- Create 8 subscriber users
- Create 5 charities (some featured)
- Add Stableford scores for each user
- Create a published March 2026 draw with entries and a winner
- Create a pending April 2026 draw (ready to simulate/publish)

---

### Step 6 — Start the app

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see:
```
✅ MySQL database connected successfully
✅ Database models synchronized
🚀 Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

The app opens at **http://localhost:3000**

---

## 🔑 Environment Variables

### backend/.env

```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=golf_charity_db

# JWT
JWT_SECRET=some_long_random_secret_change_this
JWT_EXPIRE=7d

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxx

# Email (optional — for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=GolfGives <your_email@gmail.com>

# Frontend URL (for Stripe redirect)
FRONTEND_URL=http://localhost:3000

UPLOAD_DIR=uploads
```

### frontend/.env

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
```

---

## 💳 Stripe Setup

Stripe is required for the subscription checkout flow. To set it up:

### 1. Create a Stripe account
Go to https://dashboard.stripe.com and sign up (use test mode).

### 2. Create two products

In Stripe Dashboard → Products → Add Product:

**Product 1: Monthly Plan**
- Name: `GolfGives Monthly`
- Price: £9.99 / month (recurring)
- Copy the **Price ID** → paste into `STRIPE_MONTHLY_PRICE_ID`

**Product 2: Yearly Plan**
- Name: `GolfGives Yearly`
- Price: £99.99 / year (recurring)
- Copy the **Price ID** → paste into `STRIPE_YEARLY_PRICE_ID`

### 3. Get API keys

Stripe Dashboard → Developers → API Keys:
- **Publishable key** → `REACT_APP_STRIPE_PUBLISHABLE_KEY` (frontend)
- **Secret key** → `STRIPE_SECRET_KEY` (backend)

### 4. Set up webhook (for local development)

Install the Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
stripe listen --forward-to localhost:5000/api/subscriptions/webhook
```

Copy the webhook signing secret shown in the terminal → paste into `STRIPE_WEBHOOK_SECRET`

> **Note:** Without Stripe configured, the subscribe button will show an error. All other features (scores, draws, charities, admin) work without Stripe.

---

## 🌱 Seeding the Database

```bash
cd backend
npm run seed
```

⚠️ **Warning:** The seeder runs `sequelize.sync({ force: true })` which **drops all existing tables**. Only run this on a fresh/dev database.

---

## 🔐 Test Credentials

After running the seed:

| Role  | Email                    | Password     |
|-------|--------------------------|--------------|
| Admin | admin@golfcharity.com    | Admin@12345  |
| User  | james@example.com        | User@12345   |
| User  | sophie@example.com       | User@12345   |
| User  | liam@example.com         | User@12345   |
| User  | emma@example.com         | User@12345   |
| User  | oliver@example.com       | User@12345   |

All 8 subscriber accounts use password: `User@12345`

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint         | Auth     | Description            |
|--------|------------------|----------|------------------------|
| POST   | /auth/register   | —        | Register new user      |
| POST   | /auth/login      | —        | Login                  |
| GET    | /auth/me         | JWT      | Get current user       |
| PUT    | /auth/profile    | JWT      | Update profile         |
| PUT    | /auth/password   | JWT      | Change password        |

### Scores
| Method | Endpoint       | Auth               | Description                 |
|--------|----------------|--------------------|-----------------------------|
| GET    | /scores        | JWT + Active sub   | Get my 5 scores             |
| POST   | /scores        | JWT + Active sub   | Add score (rolling logic)   |
| PUT    | /scores/:id    | JWT + Active sub   | Update score                |
| DELETE | /scores/:id    | JWT + Active sub   | Delete score                |

### Charities
| Method | Endpoint               | Auth | Description            |
|--------|------------------------|------|------------------------|
| GET    | /charities             | —    | List all charities     |
| GET    | /charities/:id         | —    | Single charity         |
| POST   | /charities/:id/donate  | JWT  | Independent donation   |

### Draws
| Method | Endpoint            | Auth | Description           |
|--------|---------------------|------|-----------------------|
| GET    | /draws              | JWT  | List draws            |
| GET    | /draws/:id          | JWT  | Draw detail + results |
| GET    | /draws/my-entries   | JWT  | My draw entries       |

### Subscriptions
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /subscriptions/checkout     | JWT  | Create Stripe session    |
| POST   | /subscriptions/cancel       | JWT  | Cancel subscription      |
| GET    | /subscriptions/status       | JWT  | Get subscription status  |
| GET    | /subscriptions/payments     | JWT  | Payment history          |
| POST   | /subscriptions/webhook      | —    | Stripe webhook handler   |

### Winners
| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | /winners/my           | JWT  | My winnings              |
| POST   | /winners/:id/proof    | JWT  | Upload proof image       |

### Admin (all require Admin role)
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | /admin/analytics                | Dashboard stats                |
| GET    | /admin/users                    | List users (search + filter)   |
| GET    | /admin/users/:id                | User detail + scores/winnings  |
| PUT    | /admin/users/:id                | Update user                    |
| GET    | /admin/scores/:userId           | User's scores                  |
| PUT    | /admin/scores/:id               | Edit a score                   |
| POST   | /admin/charities                | Create charity                 |
| PUT    | /admin/charities/:id            | Update charity                 |
| DELETE | /admin/charities/:id            | Delete charity                 |
| POST   | /admin/draws                    | Create draw                    |
| POST   | /admin/draws/:id/simulate       | Run simulation (pre-analysis)  |
| POST   | /admin/draws/:id/publish        | Publish draw + create winners  |
| GET    | /admin/winners                  | All winners (filter by status) |
| PUT    | /admin/winners/:id/verify       | Approve or reject winner       |
| PUT    | /admin/winners/:id/pay          | Mark winner as paid            |
| GET    | /admin/draw-stats               | Draw statistics                |

---

## ✅ Feature Checklist

### User Features
- [x] Register & login with JWT authentication
- [x] Choose subscription plan (monthly £9.99 / yearly £99.99)
- [x] Stripe checkout with webhook handling
- [x] Rolling 5-score system (oldest replaced automatically)
- [x] Stableford score validation (1–45)
- [x] Select and change charity
- [x] Set charity contribution percentage (min 10%)
- [x] Make independent donations
- [x] View draw results and matched numbers
- [x] Upload proof for jackpot claims
- [x] View winnings and payment status
- [x] Cancel subscription

### Admin Features
- [x] Analytics dashboard (users, revenue, charity totals)
- [x] User management (view, edit, activate, cancel)
- [x] Edit user scores directly
- [x] Create draws (random or algorithmic)
- [x] Run draw simulation / pre-analysis
- [x] Publish draw (creates winner records automatically)
- [x] Jackpot rollover logic
- [x] View all winners by status
- [x] Approve / reject winner submissions
- [x] Mark payouts as completed
- [x] Charity management (CRUD + featured toggle)

### Technical
- [x] Mobile-first responsive design
- [x] JWT authentication with automatic token refresh
- [x] Subscription status check on protected routes
- [x] Multer file uploads for winner proof
- [x] Stripe webhook for subscription lifecycle
- [x] Sequelize transactions for draw publishing
- [x] Full error handling middleware
- [x] Database seeder with realistic sample data

---

## 🌐 Deployment

### Deploy Backend (Railway / Render / VPS)

1. Push backend to GitHub
2. Create new project on Railway or Render
3. Add all environment variables from `.env`
4. Set `NODE_ENV=production`
5. Change `DB_HOST` to your production MySQL host
6. Deploy — build command: `npm install`, start: `npm start`

### Deploy Frontend (Vercel)

1. Push frontend to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
4. Deploy

### Production MySQL (PlanetScale / Railway MySQL)

1. Create a new MySQL database
2. Update `DB_*` variables in backend `.env`
3. Run the seed if needed: `npm run seed`

### Update Stripe for Production

1. Switch to live mode in Stripe Dashboard
2. Update webhook endpoint to `https://your-backend.com/api/subscriptions/webhook`
3. Replace all `pk_test_` and `sk_test_` keys with `pk_live_` and `sk_live_`

---

## 🐛 Troubleshooting

**"Can't connect to MySQL"**
- Make sure MySQL service is running: `sudo service mysql start` (Linux) or via MySQL Workbench
- Check `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`
- Ensure the database `golf_charity_db` exists

**"JWT malformed / Not authorized"**
- Make sure `JWT_SECRET` is set in `.env`
- Clear localStorage in browser and log in again

**"Stripe checkout not working"**
- Ensure `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_YEARLY_PRICE_ID` are set correctly
- Check that Stripe keys are for the same mode (test or live)
- Run `stripe listen` CLI for local webhook testing

**"CORS error"**
- Ensure `FRONTEND_URL=http://localhost:3000` is set in backend `.env`
- Restart the backend after changing `.env`

**React "proxy" not working**
- The frontend `package.json` has `"proxy": "http://localhost:5000"`
- This only works with `npm start` (not in production build)

---


Built as a sample assignment for Digital Heroes — digitalheroes.co.in
