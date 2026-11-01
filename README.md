# 🎯 Job Hunt OS — Multi-Module Smart Career & Recruiting Platform

> **Comprehensive Career Ecosystem for Employees, Employers, and Administrators**  
> An all-in-one platform connecting job applicants with hiring employers, featuring drag-and-drop pipelines, ATS resume parsing, skill gap analysis, interview retrospectives, and administrator controls.

---

## 🏛️ The Three Integrated Modules

### 1. 👤 Employee / Candidate Workspace
- **Resume Upload & AI Parsing**:
  - Upload resumes in **PDF, TXT, DOC, DOCX** formats.
  - Automatically parses text and extracts technical skills into the candidate profile.
  - Download or preview uploaded resume files with 1-click.
  - Re-scans all tracked applications against newly uploaded resume.
- **Find Jobs & 1-Click Apply**:
  - Explore active verified job postings published by platform employers.
  - Live personalized **ATS Match Score** badge on every job card.
  - Submit 1-click applications with attached resume file and custom pitch note.
- **Interactive Kanban Board**:
  - Track applications across 6 stages: *Wishlist*, *Applied*, *Screening*, *Interviewing*, *Offer Received*, and *Archived / Rejected*.
  - Native HTML5 Drag-and-Drop column transitions.
- **Skill Gap & AI Matching Engine**:
  - Compare resume against any pasted job description or active listing.
  - Highlights *Matched Skills* and pinpoints *Missing Prerequisites*.
  - Actionable prep advice to bridge gaps before interviews.
- **Interviews, Question Bank (STAR) & Feedback**:
  - Schedule interview rounds, attach video links (Meet/Zoom), prep focus.
  - Log interview questions, self-confidence ratings (1-5 stars), and retrospective feedback.
- **Analytics & Funnel**:
  - Dynamic Chart.js visualizations (Funnel Bar, Status Doughnut, Monthly Velocity Line, Source Efficiency).
  - Background scheduled follow-up alerts (`node-cron`).

### 2. 🏢 Employer / Recruiter Workspace
- **Company Profile Management**:
  - Company branding, industry, employee count, website, and company description.
- **Job Postings Management**:
  - Create and publish job openings: Title, Department, Location, Work Mode (Remote/Hybrid/Onsite), Salary Range, Required Skills, and Detailed Descriptions.
  - Edit, pause, or close job postings; view applicant counts per role.
- **ATS Candidate Pipeline**:
  - Centralized dashboard of all applicants across all posted jobs.
  - View candidate resume PDF/file, parsed resume text, and ATS match score.
  - Filter by Job, Candidate Stage, or search by name.
  - Advance candidates through hiring stages: *Applied*, *Screening*, *Interviewing*, *Offer*, *Rejected* (automatically alerts the candidate).
  - Internal recruiter hiring notes.
- **Schedule Candidate Interviews**:
  - Schedule interviews directly with applicants (dates, rounds, Meet/Zoom links).
  - Automatically generates an alert and calendar event for the candidate.
- **Employer Hiring Analytics**:
  - Candidate conversion funnel, active screen count, average applicant skill qualification rate.

### 3. 🛡️ Admin Governance Console
- **Platform Health & Metrics**:
  - Total users breakdown (Employees, Employers, Admins).
  - Total job postings and total applications processed.
  - Placement / offer conversion rate.
  - System telemetry: MongoDB status, Node.js version, heap memory, uptime.
- **User Management**:
  - View all registered users; search by name, email, or company.
  - Instant role switcher: elevate or reassign roles (`employee` ↔ `employer` ↔ `admin`).
  - Toggle user account status (*Active* / *Suspended*).
  - Permanently delete non-compliant users.
- **Job Moderation**:
  - View all jobs platform-wide.
  - 1-click **Feature** badge toggle to highlight high-quality openings.
  - Moderate / remove non-compliant job postings.
- **Platform-Wide Announcements**:
  - Broadcast system notifications to all active employees and employers simultaneously.
- **Global Scheduler Trigger**:
  - Execute automated background cron scans for overdue follow-ups and interview reminders on demand.

---

## ⚡ 1-Click Instant Demo Credentials

Use the demo buttons on the login screen, or sign in with:

| Module | Email | Password | Role / Persona |
| :--- | :--- | :--- | :--- |
| **Employee** | `demo@jobhuntos.com` | `password123` | **Alex Rivera** (Senior Full Stack Engineer) |
| **Employer** | `employer@techcorp.com` | `password123` | **Elena Rostova** (TechCorp Labs Talent Team) |
| **Admin** | `admin@jobhuntos.com` | `password123` | **Jordan Vance** (Platform Super Administrator) |

> **Pro Tip**: Use the role badge at the top-left of the navigation bar to switch between workspaces instantly without logging out!

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js (`react-chartjs-2`), Lucide React icons, Axios.
- **Backend**: Node.js, Express, MongoDB with Mongoose, JWT authentication, `multer`, `pdf2json` resume parser, `node-cron`.
- **AI & Skill Extraction**: Google Gemini API integration + built-in semantic tech taxonomy engine.

---

## 🚀 Running Locally

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Populates Employee, Employer, Admin, jobs, and applications
npm run dev      # Runs API on http://localhost:5050
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev      # Runs Vite on http://localhost:5174
```

---

## 📂 Project Structure

```
job-hunt-os/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation with 1-click role switcher
│   │   │   ├── ResumeManagerModal.jsx   # Candidate resume file upload & skills
│   │   │   ├── JobBoardView.jsx         # Employee job explorer & 1-click apply
│   │   │   ├── KanbanBoard.jsx          # Drag-and-drop pipeline board
│   │   │   ├── EmployerModule.jsx       # Employer ATS applicants, jobs & interviews
│   │   │   ├── AdminModule.jsx          # Admin overview, users, moderation & broadcast
│   │   │   ├── SkillGapView.jsx         # AI skill gap comparison sandbox
│   │   │   ├── InterviewsView.jsx       # Schedule, rounds & meeting links
│   │   │   ├── QuestionBankView.jsx     # STAR repository & interview retrospectives
│   │   │   ├── AnalyticsView.jsx        # Chart.js dashboards & success rates
│   │   │   ├── ApplicationModal.jsx     # Custom job application creator
│   │   │   ├── ApplicationDetailModal.jsx # Detailed job audit & candidate resume
│   │   │   ├── InterviewModal.jsx       # Interview scheduler modal
│   │   │   ├── QuestionModal.jsx        # Question logger modal
│   │   │   ├── NotificationsModal.jsx   # Scheduled reminders center
│   │   │   ├── ProfileModal.jsx         # Profile settings with resume link
│   │   │   └── AuthModal.jsx            # 1-Click demo logins for all 3 roles
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # JWT session & active role provider
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with bearer interceptor
│   │   └── App.jsx                      # Main app shell with role routing
│   └── package.json
└── server/
    ├── src/
    │   ├── models/
    │   │   ├── User.js                  # User profile with role & resume upload fields
    │   │   ├── Job.js                   # Employer job postings
    │   │   ├── Application.js           # Candidate applications linking job & employer
    │   │   ├── Interview.js             # Interview rounds, links & feedback
    │   │   ├── QuestionBank.js          # STAR questions
    │   │   └── Notification.js          # Background cron notifications
    │   ├── middleware/
    │   │   └── auth.js                  # JWT authentication middleware
    │   ├── routes/
    │   │   ├── auth.js                  # Register, login, role switch
    │   │   ├── jobs.js                  # Platform jobs & 1-click candidate apply
    │   │   ├── resume.js                # Resume upload (multer) & skill extraction
    │   │   ├── employer.js              # Employer ATS applicants, stages & stats
    │   │   ├── admin.js                 # Admin users, moderation & broadcast
    │   │   ├── applications.js          # Candidate application CRUD
    │   │   ├── interviews.js            # Interview scheduling
    │   │   ├── questions.js             # Question bank
    │   │   ├── analytics.js             # Funnel & source stats
    │   │   ├── notifications.js         # Alerts
    │   │   └── ai.js                    # Gemini & skill extraction
    │   ├── services/
    │   │   ├── resumeService.js         # Multer disk storage & pdf2json parser
    │   │   ├── aiService.js             # Gemini & skill matching engine
    │   │   └── cronService.js           # node-cron scheduled reminders
    │   └── scripts/
    │       └── seed.js                  # Comprehensive seeder for all 3 modules
    ├── uploads/
    │   └── resumes/                     # Uploaded candidate resume files
    ├── index.js                         # Express entrypoint
    └── package.json
```
