# 🚀 AI Job Application Tracker

An intelligent, full-stack job application tracking platform powered by **Google Gemini AI**. Upload your resume, get AI-driven skill extraction, discover matching jobs across LinkedIn, Indeed, and Glassdoor — and track every application from one beautiful dashboard.

---

## ✨ Features

### 📄 Smart Resume Parsing
- Upload your PDF resume and let Gemini AI extract your **skills**, **experience**, **preferred roles**, and optimized **search queries** automatically
- Supports drag-and-drop upload with real-time analysis feedback

### 🔍 AI-Powered Job Search
- Searches across **LinkedIn, Indeed, Glassdoor**, and more via the JSearch API
- Filters by location, remote-only, employment type, and posting date
- De-duplicates results from multiple search queries
- One-click **"Track"** to save any discovered job to your tracker

### 📊 Campaign Dashboard
- At-a-glance stats: Applied, Interviews, Offers, Rejected
- Clickable status cards to filter jobs instantly
- Real-time search across job titles and companies
- Animated, responsive layout with Framer Motion

### 🤖 Job Description Analysis
- Paste any job description and Gemini extracts:
  - **Required Skills** — technical and soft skills
  - **Experience Level** — years and type of experience
  - **Key Responsibilities** — summarized duties
  - **Red Flags** — unpaid trials, missing salary, toxic language
- Auto-saves analysis results to the job record

### 🛡️ Production-Ready Backend
- **Helmet** security headers + strict **CORS** policy
- **Rate limiting** to prevent API abuse
- **Zod** schema validation for all environment variables
- **Graceful shutdown** with proper DB cleanup
- Structured error handling with consistent API responses

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Zustand** | Lightweight state management |
| **Framer Motion** | Animations & transitions |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime |
| **Express** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Google Gemini AI** | Resume analysis & job description parsing |
| **JSearch API** | Multi-platform job search (via RapidAPI) |
| **pdf-parse v2** | PDF text extraction |
| **Zod** | Environment & request validation |
| **Helmet** | Security headers |
| **Jest + Supertest** | Testing |

---

## 📁 Project Structure

```
ai-job-tracker/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # Layout wrapper
│   │   │   └── ui/             # Toast notifications
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route pages
│   │   │   ├── Dashboard.jsx   # Main dashboard with stats & job list
│   │   │   ├── AddJob.jsx      # Add new job application
│   │   │   ├── JobDetail.jsx   # Job detail view + AI analysis
│   │   │   ├── ResumeSearch.jsx # Resume upload + job search flow
│   │   │   └── NotFound.jsx    # 404 page
│   │   ├── services/           # API client functions
│   │   ├── store/              # Zustand state stores
│   │   ├── styles/             # Global CSS, tokens, animations
│   │   └── utils/              # Helpers (date formatting, etc.)
│   └── vite.config.js
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # DB connection, env validation, constants
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Error handling, rate limiting, logging
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   │   ├── gemini.service.js    # Job description AI analysis
│   │   │   ├── resume.service.js    # Resume parsing + AI extraction
│   │   │   ├── jobSearch.service.js # JSearch API integration
│   │   │   └── job.service.js       # CRUD operations
│   │   └── validators/        # Zod request schemas
│   └── tests/                  # Unit & integration tests
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))
- **RapidAPI Key** for JSearch ([Subscribe here](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch))

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-job-tracker.git
cd ai-job-tracker
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ai-job-tracker
ALLOWED_ORIGINS=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

### 3. Set up the frontend

```bash
cd ../client
npm install
```

### 4. Run the application

**Terminal 1 — Start the backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Start the frontend:**
```bash
cd client
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/jobs` | List all jobs (with optional `?status=` filter) |
| `GET` | `/api/jobs/stats` | Get job count by status |
| `GET` | `/api/jobs/:id` | Get a single job |
| `POST` | `/api/jobs` | Create a new job |
| `PUT` | `/api/jobs/:id` | Update a job |
| `DELETE` | `/api/jobs/:id` | Delete a job |
| `POST` | `/api/analyze` | Analyze a job description with Gemini AI |
| `POST` | `/api/resume/upload` | Upload & analyze a PDF resume |
| `POST` | `/api/resume/search` | Search jobs based on resume analysis |

---

## 🧪 Running Tests

```bash
cd server
npm test
```

Tests include:
- **Unit tests** for Gemini service and job service
- **Integration tests** for job API routes

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated CORS origins |
| `GEMINI_API_KEY` | No* | — | Google Gemini API key |
| `RAPIDAPI_KEY` | No* | — | RapidAPI key for JSearch |

> *Required for AI analysis and job search features to work.

---

## 📸 Pages

| Page | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Stats overview, job list with search & filters |
| **Add Job** | `/add` | Form to add a new job application |
| **Job Detail** | `/job/:id` | Full job view with AI analysis trigger |
| **Resume Search** | `/resume-search` | 3-step flow: Upload → Review Skills → Browse Results |

---

## 🏗️ Architecture Highlights

- **Layered backend** — Routes → Controllers → Services → Models
- **Zod validation** at startup ensures no missing env vars
- **Gemini retry with exponential backoff** (3 attempts, 30s timeout)
- **Rate limiting** on all `/api` routes
- **Status history tracking** via Mongoose pre-save hooks
- **Client-side search + server-side filtering** for responsive UX

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, Express, MongoDB, and Google Gemini AI
</p>
