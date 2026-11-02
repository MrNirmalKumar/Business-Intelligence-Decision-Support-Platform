# BIDSP — Business Intelligence & Decision Support Platform

A full-stack, enterprise-grade Business Intelligence & Decision Support Platform (BIDSP) built with **React.js, Tailwind CSS, Node.js, Express.js, and MongoDB**.

---

## 🚀 Key Features

1. **Enterprise Authentication & Session Security**:
   - JWT-based authentication with bcrypt password hashing (cost factor 12).
   - Protected routing in React with automatic token injection via Axios interceptors.
   - Profile session restore on page refresh.

2. **Smart Dataset Ingestion & Automated ETL**:
   - Drag-and-drop file upload supporting `.csv`, `.xlsx`, and `.xls` files (up to 10 MB).
   - Intelligent column normalizer that automatically maps aliases (`order_id`, `sales`, `profit`, `category`, `region`, etc.).
   - Instant dataset preview with tabular inspection of parsed records.

3. **Executive Analytics Dashboard**:
   - **KPI Overview**: Total Sales, Total Profit, Profit Margin %, Total Orders, Total Units Sold, Average Order Value (AOV).
   - **Business Health Score (0–100)**: Real-time score gauge reflecting financial stability.
   - **Interactive Recharts Visualizations**:
     - Monthly Sales Trend (Area Chart)
     - Monthly Net Profit Trend (Area Chart)
     - Category Performance (Bar Chart)
     - Regional Territory Performance (Multi-bar Chart)

4. **Rule-Based Decision Intelligence Engine**:
   - Automated evaluation of business anomalies:
     - *Profitability Rules*: Identifies low-margin or loss-making departments and recommends pricing strategies.
     - *Discount Rules*: Flags margin erosion caused by excessive discounting.
     - *Regional Rules*: Highlights regional fulfillment disparities and supply chain opportunities.
   - Categorized by severity (`High`, `Medium`, `Low`) with targeted strategic recommendations.

5. **Business Health Score Algorithm**:
   - $\text{Health Score} = (0.30 \times \text{Sales}) + (0.30 \times \text{Profitability}) + (0.20 \times \text{Orders}) + (0.20 \times \text{Regional})$
   - Standardized grading:
     - **80 – 100**: Excellent
     - **60 – 79**: Good
     - **40 – 59**: Average
     - **< 40**: Needs Attention

6. **Executive Performance Reports**:
   - Formal syntheses with audit tables, category breakdowns, and decision recommendations.
   - One-click browser print / PDF export styling.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology | Responsibilities |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Recharts, Lucide React, Axios | Nirmal |
| **Backend** | Node.js, Express.js, Multer, Zod, Compression, Rate Limiting | Priyanshu |
| **Database** | MongoDB (Mongoose ODM) | Priyanshu |
| **Authentication**| JWT (JSON Web Tokens), bcrypt | Priyanshu |

---

## 📂 Project Structure

```text
BIDSP_5th_PR/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & env validation
│   │   ├── controllers/     # Auth, Dataset, Dashboard, Insight controllers
│   │   ├── middleware/      # Auth JWT guard, Multer upload, Error handler
│   │   ├── models/          # User, Dataset, DatasetRecord, Insight, HealthScore
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Automated ETL & Rule-based engine
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler, seedDemo
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # Server entry point
│   ├── uploads/             # Ingested datasets directory
│   ├── sample_superstore.csv# Sample business dataset for testing
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Layout, Button, Card, Loader
│   │   ├── context/         # AuthContext with token session handling
│   │   ├── pages/           # Login, Register, Dashboard, Upload, History, Insights, Reports, Profile, Help, NotFound
│   │   ├── routes/          # ProtectedRoute wrapper
│   │   ├── services/        # Axios API service callers
│   │   ├── App.jsx          # Route orchestration
│   │   ├── main.jsx         # App mounting
│   │   └── index.css        # Tailwind CSS theme & utilities
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚦 How to Run the Project Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on default port `27017`

### 2. Backend Setup
```bash
cd backend
npm install
node src/server.js
```
The server will start on `http://localhost:5000`.

*(Optional: To re-seed the demo account and sample dataset at any time, run `node src/utils/seedDemo.js`)*.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

For quick testing without creating a new account:
- **Email:** `demo@bidsp.com`
- **Password:** `Password123`

*(You can also click **"Fill with Demo Credentials"** on the Login screen, or register a new user).*

---

## 📡 Key API Endpoints

### Auth
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login & receive JWT
- `GET /api/auth/profile` — Get authenticated user details
- `POST /api/auth/logout` — Logout user session

### Datasets
- `POST /api/datasets/upload` — Multipart upload (`.csv`, `.xlsx`, `.xls`) & instant ETL trigger
- `GET /api/datasets` — Get user's datasets
- `GET /api/datasets/:id` — Get dataset details & status
- `GET /api/datasets/:id/preview` — Get first 20 records
- `DELETE /api/datasets/:id` — Delete dataset and related metrics

### Dashboard
- `GET /api/dashboard/:datasetId/summary` — Aggregated KPI summary
- `GET /api/dashboard/:datasetId/sales-trend` — Monthly sales progression
- `GET /api/dashboard/:datasetId/profit-trend` — Monthly profit progression
- `GET /api/dashboard/:datasetId/category-performance` — Sales & profit by category
- `GET /api/dashboard/:datasetId/region-performance` — Regional market share
- `GET /api/dashboard/:datasetId/shipping-analysis` — Fulfillment method analysis

### Insights & Health
- `GET /api/insights?datasetId=...&category=...&severity=...` — Rule-based recommendations
- `GET /api/insights/health-score/:datasetId` — Weighted composite health score breakdown
- `GET /api/insights/:id` — Specific insight details
