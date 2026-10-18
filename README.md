# Job Hunt OS — Smart Job Search Platform

> **Best for your career goals**  
> An all-in-one workspace for people applying to jobs, tracking interviews, and identifying skill gaps.

---

## Key Features

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
