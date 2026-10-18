# 🎯 Job Hunt OS — Smart Job Search Platform

> **Best for your career goals**  
> An all-in-one workspace for people applying to jobs, tracking interviews, and identifying skill gaps.

---

## 🌟 Key Features

1. **Interactive Kanban Board**
   - Visualize and transition applications across 6 stages: *Wishlist*, *Applied*, *Screening*, *Interviewing*, *Offer Received*, and *Archived / Rejected*.
   - Native HTML5 Drag-and-Drop column transitions.
   - Live ATS resume match score pill on every card.
   - Priority badges, salary expectations, location / remote type, and days since last contact.
   - Search by company, role, or keywords with priority filters.

2. **Save Job Descriptions & Interview Dates**
   - Save full job descriptions and requirement listings.
   - Schedule upcoming technical interviews, recruiter screens, live coding sessions, and system design rounds.
   - Meeting link integration (Zoom / Google Meet / Teams) with direct 1-click launch.
   - Interviewer tracking with names and LinkedIn profiles.
   - Targeted preparation notes and key focus reminders.

3. **Match Resume Skills Against Job Requirements (AI Skill Gap Engine)**
   - Upload / paste resume and profile skills.
   - Automatic extraction of required technologies from job descriptions.
   - Dual-mode AI Analyzer:
     - Direct **Google Gemini API** integration when `GEMINI_API_KEY` is present.
     - Built-in natural language semantic skill matching engine with tech ontology covering Frontend, Backend, Databases, Cloud/DevOps, and System Architecture.
   - Highlights exact **Matched Skills** (green badges) and pinpoints **Missing Requirements** (amber badges).
   - Generates actionable preparation strategies and portfolio adjustment advice to bridge the gap before the interview.

4. **Analyze Application Success Rates & Follow-Up Reminders**
   - **Chart.js** dynamic visualizations:
     - Pipeline Stage Funnel Bar Chart
     - Status Distribution Doughnut Chart
     - 6-Month Application Velocity Area / Line Chart
     - Source Conversion Efficiency (Applications vs Interviews by channel)
   - Real-time KPI counters: Interview Rate %, Written Offer Rate %, Average ATS Match %, and Overdue Follow-ups.
   - Top missing skills widget indicating what technologies appear most frequently across your dream companies.
   - **Automated Scheduled Jobs (`node-cron`)**:
     - Daily automated scan checking for stale applications (no response in 5+ days) and upcoming interviews within 24-48 hours.
     - On-demand "Trigger Follow-up Cron" button to test or refresh background alerts instantly.

5. **Track Interview Questions & Personal Feedback**
   - Dedicated Question Bank categorized by *Technical*, *System Design*, *Live Coding*, *Behavioral (STAR)*, and *Culture Fit*.
   - Log exact questions asked during specific interview rounds.
   - Record self-rating (1 to 5 stars), notes on answers given, and feedback received.
   - Expandable answer key and personal retrospective notes.
   - Integrated practice session counter to track preparation frequency.
   - **AI Interview Question Generator** tailored to your target roles.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js (`react-chartjs-2`), Lucide React icons, Axios.
- **Backend**: Node.js, Express, MongoDB with Mongoose ODM, JSON Web Tokens (JWT) authentication, bcryptjs, Morgan logger.
- **Scheduled Jobs**: `node-cron` automated background daemon for follow-up reminders and interview countdowns.
- **AI Integration**: Google Gemini API support + Semantic NLP matching engine.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Start Server
```bash
cd server
npm install
npm run seed     # Seeds demo user & sample applications (Stripe, OpenAI, Airbnb, etc.)
npm run dev      # Starts API on http://localhost:5050
```

### 2. Start Client
```bash
cd client
npm install
npm run dev      # Starts Vite on http://localhost:5174
```

### 3. Demo Account Credentials
- **Email**: `demo@jobhuntos.com`
- **Password**: `password123`
*(Or click the glowing **"Launch Demo Account (1-Click Instant)"** button on the sign-in modal!)*

---

## 📂 Project Architecture

```
job-hunt-os/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation & notification bell
│   │   │   ├── KanbanBoard.jsx          # Drag-and-drop 6-stage pipeline
│   │   │   ├── SkillGapView.jsx         # Live ATS comparison & gap analysis
│   │   │   ├── InterviewsView.jsx       # Schedule, rounds & meeting links
│   │   │   ├── QuestionBankView.jsx     # STAR method questions & feedback
│   │   │   ├── AnalyticsView.jsx        # Chart.js dashboards & conversion rates
│   │   │   ├── ApplicationModal.jsx     # Add new job posting modal
│   │   │   ├── ApplicationDetailModal.jsx # Full job & skill breakdown
│   │   │   ├── InterviewModal.jsx       # Schedule round modal
│   │   │   ├── QuestionModal.jsx        # Log question modal
│   │   │   ├── NotificationsModal.jsx   # Scheduled job alert center
│   │   │   ├── ProfileModal.jsx         # Resume skills & target role
│   │   │   └── AuthModal.jsx            # Sign in / register / 1-click demo
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # JWT session provider
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with bearer interceptor
│   │   ├── App.jsx                      # Main app shell & modal wiring
│   │   └── index.css                    # Tailwind CSS directives
│   ├── vite.config.js                   # Port 5174 + API reverse proxy
│   └── package.json
└── server/
    ├── src/
    │   ├── models/
    │   │   ├── User.js                  # User profile & resume skills
    │   │   ├── Application.js           # Tracked job applications
    │   │   ├── Interview.js             # Rounds, links, questions & feedback
    │   │   ├── QuestionBank.js          # Reusable interview questions
    │   │   └── Notification.js          # Scheduled follow-up & interview reminders
    │   ├── middleware/
    │   │   └── auth.js                  # JWT verification middleware
    │   ├── routes/
    │   │   ├── auth.js                  # Auth, register, login, profile
    │   │   ├── applications.js          # CRUD + status patch + rescan
    │   │   ├── interviews.js            # Interview schedules & logs
    │   │   ├── questions.js             # Question bank management
    │   │   ├── analytics.js             # Funnel, source & conversion stats
    │   │   ├── notifications.js         # Alerts & cron trigger
    │   │   └── ai.js                    # Skill gap & question generation
    │   ├── services/
    │   │   ├── aiService.js             # Gemini API + Semantic skill matcher
    │   │   └── cronService.js           # node-cron scheduled jobs
    │   ├── scripts/
    │   │   └── seed.js                  # Comprehensive database seeder
    │   └── index.js                     # Express server & DB connection
    ├── .env
    └── package.json
```
