require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const QuestionBank = require('../models/QuestionBank');
const Notification = require('../models/Notification');
const { analyzeSkillGap } = require('../services/aiService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_hunt_os';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing seed data
    await User.deleteMany({ email: 'demo@jobhuntos.com' });
    const existingUsers = await User.find({ email: 'demo@jobhuntos.com' });
    const existingUserIds = existingUsers.map(u => u._id);
    if (existingUserIds.length > 0) {
      await Application.deleteMany({ user: { $in: existingUserIds } });
      await Interview.deleteMany({ user: { $in: existingUserIds } });
      await QuestionBank.deleteMany({ user: { $in: existingUserIds } });
      await Notification.deleteMany({ user: { $in: existingUserIds } });
    }

    // 1. Create Demo User
    const demoUser = new User({
      name: 'Alex Rivera',
      email: 'demo@jobhuntos.com',
      password: 'password123',
      targetRole: 'Senior Full Stack Engineer',
      targetSalary: 165000,
      location: 'San Francisco, CA / Remote',
      experienceYears: 5,
      bio: 'Full-stack software engineer passionate about scalable distributed systems, polished UX, and modern web architectures.',
      resumeSkills: [
        'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
        'MongoDB', 'PostgreSQL', 'REST APIs', 'GraphQL', 'Docker',
        'Tailwind CSS', 'Next.js', 'Git', 'Agile', 'Microservices'
      ],
      resumeText: `Alex Rivera - Senior Full-Stack Engineer
5+ years designing and implementing scalable web applications using React, TypeScript, Node.js, Express, MongoDB, and PostgreSQL.
Architected resilient microservices deployed with Docker and Kubernetes on AWS.
Built high-performance UI components with Tailwind CSS and Next.js, boosting core web vitals by 40%.
Strong background in REST APIs, GraphQL, TDD, and CI/CD pipelines.`,
      followUpDefaultDays: 5
    });

    await demoUser.save();
    console.log('[Seed] Created demo user: demo@jobhuntos.com (password: password123)');

    // 2. Create Realistic Applications
    const sampleAppsData = [
      {
        company: 'Stripe',
        role: 'Staff Full-Stack Engineer',
        location: 'San Francisco, CA (Hybrid)',
        workType: 'Hybrid',
        status: 'Offer',
        priority: 'High',
        source: 'Referral',
        salary: { min: 185000, max: 210000, currency: 'USD' },
        jobDescription: `Stripe is looking for a Staff Full-Stack Engineer to lead billing infrastructure.
Requirements: Deep expertise in React, TypeScript, Node.js, Distributed Systems, System Design, PostgreSQL, Kafka, and Microservices. Experience with high-throughput payment pipelines, idempotent APIs, and AWS.`,
        applicationDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Resolved',
        recruiter: { name: 'Sarah Jenkins', email: 'sarah.j@stripe.com', linkedin: 'linkedin.com/in/sarahjenkins-recruiter' },
        notes: 'Final offer letter received! $195,000 base + equity package.'
      },
      {
        company: 'OpenAI',
        role: 'Full-Stack Applications Engineer',
        location: 'San Francisco, CA (Hybrid)',
        workType: 'Hybrid',
        status: 'Interviewing',
        priority: 'High',
        source: 'Company Website',
        salary: { min: 190000, max: 240000, currency: 'USD' },
        jobDescription: `Join the team building user-facing AI applications.
Requirements: Extensive experience with Next.js, React, TypeScript, WebSockets, Python, FastAPI, Redis, and streaming APIs. Must understand LLM prompting, low-latency client rendering, and Docker.`,
        applicationDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Pending',
        recruiter: { name: 'Marcus Vance', email: 'mvance@openai.com' },
        notes: 'Technical screen went smoothly. System design round upcoming this week!'
      },
      {
        company: 'Airbnb',
        role: 'Senior Frontend Engineer',
        location: 'Remote - US',
        workType: 'Remote',
        status: 'Screening',
        priority: 'High',
        source: 'LinkedIn',
        salary: { min: 160000, max: 185000, currency: 'USD' },
        jobDescription: `Build world-class guest experiences.
Requirements: Strong proficiency in React, TypeScript, Web Performance, CSS3, Tailwind CSS, Accessibility (a11y), Jest, Cypress, and GraphQL. Experience with design systems and state management.`,
        applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Pending',
        recruiter: { name: 'Elena Rostova', email: 'elena.r@airbnb.com' },
        notes: 'Recruiter call completed on Friday. Waiting on scheduling technical pairing.'
      },
      {
        company: 'Datadog',
        role: 'Backend Platform Engineer',
        location: 'New York, NY (Hybrid)',
        workType: 'Hybrid',
        status: 'Applied',
        priority: 'Medium',
        source: 'Indeed',
        salary: { min: 155000, max: 180000, currency: 'USD' },
        jobDescription: `Scale our cloud observability platform.
Requirements: Go, Golang, Python, Kubernetes, Docker, Terraform, Distributed Tracing, PostgreSQL, Kafka, Linux, and Cloud Infrastructure (AWS or GCP).`,
        applicationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Pending',
        recruiter: { name: 'David Kim', email: 'dkim@datadoghq.com' },
        notes: 'Submitted application 8 days ago. Follow-up email is due today.'
      },
      {
        company: 'Figma',
        role: 'Product Engineer - Collaboration',
        location: 'San Francisco, CA / Remote',
        workType: 'Remote',
        status: 'Wishlist',
        priority: 'High',
        source: 'LinkedIn',
        salary: { min: 175000, max: 205000, currency: 'USD' },
        jobDescription: `Design real-time collaborative workspace experiences.
Requirements: TypeScript, React, WebAssembly (Wasm), C++, Canvas API, WebSockets, Real-time CRDT synchronization, and high-performance algorithms.`,
        applicationDate: new Date(),
        lastContactDate: new Date(),
        followUpStatus: 'Pending',
        notes: 'Preparing portfolio showcasing custom canvas and real-time syncing before applying.'
      },
      {
        company: 'Uber',
        role: 'Distributed Systems Engineer',
        location: 'San Francisco, CA',
        workType: 'Hybrid',
        status: 'Rejected',
        priority: 'Low',
        source: 'Wellfound',
        salary: { min: 160000, max: 190000, currency: 'USD' },
        jobDescription: `Real-time marketplace infrastructure.
Requirements: Java, Go, gRPC, Kafka, Cassandra, Kubernetes, Linux, High-concurrency architectures.`,
        applicationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Resolved',
        notes: 'Received feedback: strong system design fundamentals, but looking for 5+ years purely in Go/Cassandra.'
      }
    ];

    const createdApps = [];
    for (const appData of sampleAppsData) {
      const gapAnalysis = await analyzeSkillGap({
        resumeText: demoUser.resumeText,
        resumeSkills: demoUser.resumeSkills,
        jobDescription: appData.jobDescription,
        role: appData.role
      });

      const app = new Application({
        user: demoUser._id,
        ...appData,
        matchedSkills: gapAnalysis.matchedSkills,
        missingSkills: gapAnalysis.missingSkills,
        matchScore: gapAnalysis.matchScore,
        aiRecommendations: gapAnalysis.aiRecommendations,
        timeline: [
          { stage: 'Wishlist', date: new Date(appData.applicationDate.getTime() - 2 * 24 * 60 * 60 * 1000), note: 'Bookmarked opening' },
          { stage: 'Applied', date: appData.applicationDate, note: 'Submitted resume and portfolio' },
          ...(appData.status === 'Screening' || appData.status === 'Interviewing' || appData.status === 'Offer'
            ? [{ stage: 'Screening', date: new Date(appData.applicationDate.getTime() + 4 * 24 * 60 * 60 * 1000), note: 'Recruiter call passed' }]
            : []),
          ...(appData.status === 'Interviewing' || appData.status === 'Offer'
            ? [{ stage: 'Interviewing', date: new Date(appData.applicationDate.getTime() + 10 * 24 * 60 * 60 * 1000), note: 'Moved into technical loops' }]
            : []),
          ...(appData.status === 'Offer'
            ? [{ stage: 'Offer', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Received written offer!' }]
            : []),
          ...(appData.status === 'Rejected'
            ? [{ stage: 'Rejected', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), note: 'Position closed to internal candidate' }]
            : [])
        ]
      });

      await app.save();
      createdApps.push(app);
    }
    console.log(`[Seed] Created ${createdApps.length} applications with AI skill gap scores.`);

    // 3. Create Sample Interviews with Questions & Feedback
    const openAiApp = createdApps.find(a => a.company === 'OpenAI');
    const stripeApp = createdApps.find(a => a.company === 'Stripe');

    // Upcoming Interview for OpenAI
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 30, 0, 0);

    const interview1 = new Interview({
      user: demoUser._id,
      application: openAiApp._id,
      company: 'OpenAI',
      role: 'Full-Stack Applications Engineer',
      round: 'System Design',
      scheduledAt: tomorrow,
      durationMinutes: 60,
      interviewers: [
        { name: 'Dr. Aris Thorne', role: 'Principal Architect', linkedin: 'linkedin.com/in/aris-thorne' }
      ],
      meetingLink: 'https://meet.google.com/abc-openai-sysdesign',
      status: 'Scheduled',
      preparationNotes: 'Review SSE (Server-Sent Events) vs WebSockets for streaming token chunks. Prepare caching layer design with Redis.',
      questionsAsked: []
    });
    await interview1.save();

    // Completed Interview for Stripe with Recorded Questions & Feedback
    const interview2 = new Interview({
      user: demoUser._id,
      application: stripeApp._id,
      company: 'Stripe',
      role: 'Staff Full-Stack Engineer',
      round: 'Technical Screen',
      scheduledAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      interviewers: [
        { name: 'Claire Zhao', role: 'Engineering Manager', linkedin: 'linkedin.com/in/claire-zhao' }
      ],
      meetingLink: 'https://zoom.us/j/992834710',
      status: 'Completed',
      preparationNotes: 'Discuss idempotency keys in payments and rate limiting strategies.',
      questionsAsked: [
        {
          question: 'How do you ensure exactly-once payment processing when client network timeouts occur?',
          category: 'System Design',
          myAnswerNotes: 'Explained Idempotency Keys generated by the frontend, stored with TTL in Redis/PostgreSQL with unique constraints before mutating ledger.',
          selfRating: 5,
          feedback: 'Interviewer was very impressed by the mention of distributed locks and race condition handling.'
        },
        {
          question: 'Write a TypeScript debounce/throttle utility with leading and trailing execution options.',
          category: 'Live Coding',
          myAnswerNotes: 'Implemented timer reference with generic typing and cleanup on unmount.',
          selfRating: 4,
          feedback: 'Code was clean and test-driven. Missed edge case on immediate cancellation on first iteration.'
        }
      ],
      personalFeedback: 'Outstanding interview experience. The interviewer appreciated concrete real-world production examples from my previous SaaS deployment.',
      retrospective: {
        strengths: 'Deep understanding of distributed consensus, idempotency, and asynchronous queue management.',
        improvements: 'Remember to ask clarifying questions about edge-case concurrency limits earlier in the live coding prompt.',
        overallScore: 5
      }
    });
    await interview2.save();
    console.log('[Seed] Created sample interviews with questions and retrospective feedback.');

    // 4. Seed Question Bank
    const sampleQuestions = [
      {
        question: 'How does React 18 Concurrent Mode & Server Components differ from traditional SSR?',
        company: 'Meta / General',
        role: 'Senior Frontend Engineer',
        category: 'Technical',
        difficulty: 'Medium',
        answerKey: 'Server Components execute only on the server and stream serialized JSON to the client with zero bundle impact. Concurrent Mode introduces interruptible rendering via useTransition and Suspense.',
        keyTakeaways: ['Zero client JS overhead for server components', 'Time-slicing long renders without freezing main thread'],
        timesPracticed: 3
      },
      {
        question: 'Design a distributed rate limiter that handles 50,000 requests per second across multiple regional clusters.',
        company: 'Stripe',
        role: 'Staff Engineer',
        category: 'System Design',
        difficulty: 'Hard',
        answerKey: 'Token Bucket or Sliding Window Counter using Redis with Lua scripts for atomic increments. Handle multi-region synchronization with eventual consistency or local token allotments per gateway pod.',
        keyTakeaways: ['Use sliding window counter over fixed window to avoid boundary spikes', 'Lua scripts prevent race conditions in Redis'],
        timesPracticed: 5
      },
      {
        question: 'Tell me about a time when you disagreed with a technical decision made by your tech lead. How did you handle it?',
        company: 'General / Behavioral',
        role: 'Software Engineer',
        category: 'Behavioral',
        difficulty: 'Medium',
        answerKey: 'STAR Method: Situation (migration from REST to GraphQL vs gRPC), Task (present data on latency vs flexibility), Action (built reproducible benchmark spikes, shared trade-off matrix neutrally), Result (aligned team and preserved cohesion).',
        keyTakeaways: ['Disagree and commit principle', 'Rely on data and benchmarks, not subjective preference'],
        timesPracticed: 4
      }
    ];

    for (const q of sampleQuestions) {
      await QuestionBank.create({
        user: demoUser._id,
        ...q
      });
    }
    console.log('[Seed] Seeded Question Bank.');

    // 5. Seed Notifications & Reminders
    await Notification.create({
      user: demoUser._id,
      type: 'FOLLOW_UP_DUE',
      title: 'Follow-up Due: Datadog',
      message: 'It has been 8 days since your last activity with Datadog for Backend Platform Engineer. Reach out to maintain momentum!',
      relatedApplication: createdApps.find(a => a.company === 'Datadog')._id,
      actionUrl: '/applications',
      isRead: false,
      dueDate: new Date()
    });

    await Notification.create({
      user: demoUser._id,
      type: 'UPCOMING_INTERVIEW',
      title: 'Interview in 24h: OpenAI',
      message: 'Your System Design interview with OpenAI is scheduled for tomorrow at 3:30 PM. Review your notes and question bank.',
      relatedInterview: interview1._id,
      actionUrl: '/interviews',
      isRead: false,
      dueDate: tomorrow
    });

    console.log('[Seed] Seeded Notifications & Reminders.');
    console.log('[Seed] Database successfully populated! Ready to launch.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
}

seedData();
