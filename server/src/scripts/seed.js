require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (e) {}
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
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

    // Clean existing seed users and their items
    const seedEmails = [
      'demo@jobhuntos.com',
      'employer@techcorp.com',
      'admin@jobhuntos.com',
      'maya.lin@example.com'
    ];
    const existingUsers = await User.find({ email: { $in: seedEmails } });
    const existingUserIds = existingUsers.map(u => u._id);

    if (existingUserIds.length > 0) {
      await Application.deleteMany({ user: { $in: existingUserIds } });
      await Job.deleteMany({ employer: { $in: existingUserIds } });
      await Interview.deleteMany({ user: { $in: existingUserIds } });
      await QuestionBank.deleteMany({ user: { $in: existingUserIds } });
      await Notification.deleteMany({ user: { $in: existingUserIds } });
      await User.deleteMany({ _id: { $in: existingUserIds } });
    }

    // ==========================================
    // 1. MODULE: EMPLOYEE DEMO (Alex Rivera)
    // ==========================================
    const demoEmployee = new User({
      name: 'Alex Rivera',
      email: 'demo@jobhuntos.com',
      password: 'password123',
      role: 'employee',
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
      resumeUrl: '/uploads/resumes/Alex_Rivera_Senior_FullStack_Resume.txt',
      resumeFileName: 'Alex_Rivera_Senior_FullStack_Resume.txt',
      resumeOriginalName: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
      resumeFileSize: 1840,
      resumeMimeType: 'text/plain',
      resumeUploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      followUpDefaultDays: 5
    });
    await demoEmployee.save();
    console.log('[Seed] Created Employee Demo: demo@jobhuntos.com / password123');

    // Additional candidate for employer applicant pipeline
    const candidate2 = new User({
      name: 'Maya Lin',
      email: 'maya.lin@example.com',
      password: 'password123',
      role: 'employee',
      targetRole: 'Lead Frontend Architect',
      targetSalary: 180000,
      location: 'Seattle, WA (Remote)',
      experienceYears: 7,
      bio: 'Frontend systems architect specializing in React 18 concurrent mode, design tokens, and web performance.',
      resumeSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Jest', 'Cypress', 'Docker', 'WebSockets'],
      resumeText: `Maya Lin - Lead Frontend Architect. 7 years specializing in React, Next.js, TypeScript design systems, accessibility, and microfrontends.`,
      resumeUrl: '/uploads/resumes/Alex_Rivera_Senior_FullStack_Resume.txt',
      resumeOriginalName: 'Maya_Lin_Principal_Frontend.pdf',
      resumeFileSize: 2150,
      resumeUploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });
    await candidate2.save();

    // ==========================================
    // 2. MODULE: EMPLOYER DEMO (TechCorp Talent)
    // ==========================================
    const demoEmployer = new User({
      name: 'Elena Rostova',
      email: 'employer@techcorp.com',
      password: 'password123',
      role: 'employer',
      companyName: 'TechCorp Labs',
      companyWebsite: 'https://techcorp.example.com',
      companyIndustry: 'Cloud Infrastructure & AI Systems',
      companySize: '250-500 employees',
      companyLocation: 'San Francisco, CA & Remote',
      companyDescription: 'TechCorp builds next-generation developer platforms, real-time collaboration tools, and enterprise AI workflows.',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60'
    });
    await demoEmployer.save();
    console.log('[Seed] Created Employer Demo: employer@techcorp.com / password123');

    // ==========================================
    // 3. MODULE: ADMIN DEMO (Super Admin)
    // ==========================================
    const demoAdmin = new User({
      name: 'Jordan Vance',
      email: 'admin@jobhuntos.com',
      password: 'password123',
      role: 'admin',
      location: 'Headquarters',
      bio: 'Platform Administrator overseeing verification, compliance, and user operations.'
    });
    await demoAdmin.save();
    console.log('[Seed] Created Admin Demo: admin@jobhuntos.com / password123');

    // ==========================================
    // 4. SEED EMPLOYER JOBS
    // ==========================================
    const employerJobsData = [
      {
        employer: demoEmployer._id,
        company: 'TechCorp Labs',
        title: 'Senior React & TypeScript Frontend Architect',
        department: 'Core Product UX',
        location: 'Remote (US & Global)',
        workType: 'Remote',
        jobType: 'Full-time',
        salary: { min: 165000, max: 195000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs', 'GraphQL', 'Jest'],
        description: `TechCorp Labs is seeking a Senior React Architect to own our core client suite.
You will architect high-throughput real-time web applications, mentor engineering squads, and establish modern component standards.
Prerequisites: 4+ years of hands-on production React & TypeScript, state machines, web performance profiling, and accessible design systems.`,
        responsibilities: [
          'Lead architecture of our flagship React/TypeScript web portal',
          'Collaborate with product designers to implement scalable design token systems',
          'Optimize core web vitals and client bundle delivery'
        ],
        benefits: ['Full remote flexibility', '401k with 5% match', 'Generous equity options', '$3,000 yearly learning budget'],
        status: 'Active',
        featured: true,
        applicantsCount: 2
      },
      {
        employer: demoEmployer._id,
        company: 'TechCorp Labs',
        title: 'Staff Distributed Systems Engineer (Node.js & Go)',
        department: 'Cloud Platform Infrastructure',
        location: 'San Francisco, CA (Hybrid)',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salary: { min: 185000, max: 220000, currency: 'USD' },
        experienceLevel: 'Lead / Staff',
        requiredSkills: ['Node.js', 'Go', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'Microservices', 'Kafka'],
        description: `Scale our distributed event-driven message bus and low-latency APIs processing billions of events per day.
Requirements: Strong mastery of asynchronous architectures, database schema optimization in MongoDB/PostgreSQL, container orchestration, and high-availability failover.`,
        responsibilities: [
          'Design resilient microservices deployed across AWS multi-region clusters',
          'Implement Kafka streaming pipelines and rate-limiting gateway proxies',
          'Lead incident post-mortems and site reliability improvements'
        ],
        benefits: ['Hybrid office in SF SOMA', 'Comprehensive health/dental', 'Equity package', 'Daily catered lunches'],
        status: 'Active',
        featured: false,
        applicantsCount: 1
      },
      {
        employer: demoEmployer._id,
        company: 'TechCorp Labs',
        title: 'Full Stack AI Solutions Engineer',
        department: 'Applied Machine Intelligence',
        location: 'Remote',
        workType: 'Remote',
        jobType: 'Full-time',
        salary: { min: 170000, max: 205000, currency: 'USD' },
        experienceLevel: 'Senior Level',
        requiredSkills: ['React', 'Python', 'Node.js', 'TypeScript', 'REST APIs', 'Docker', 'FastAPI'],
        description: `Build user-facing generative AI tools and integration copilots.
Requirements: Hands-on experience integrating LLM APIs (Gemini/OpenAI), streaming token protocols, and resilient full-stack web architectures.`,
        responsibilities: [
          'Develop full-stack web applications embedding interactive generative AI assistants',
          'Create high-throughput streaming endpoints with Server-Sent Events',
          'Build automated prompt evaluation pipelines'
        ],
        benefits: ['Flexible hours', 'Home office stipend', 'Top-tier tech setup (M3 Max MacBook Pro)'],
        status: 'Active',
        featured: true,
        applicantsCount: 1
      }
    ];

    const createdJobs = [];
    for (const jData of employerJobsData) {
      const job = new Job(jData);
      await job.save();
      createdJobs.push(job);
    }
    console.log(`[Seed] Created ${createdJobs.length} active jobs for TechCorp Labs.`);

    // ==========================================
    // 5. SEED APPLICATIONS (Linking Employee to Employer)
    // ==========================================
    // Alex Rivera applies to TechCorp Frontend Architect
    const techCorpJob1 = createdJobs[0];
    const alexGapTechCorp = await analyzeSkillGap({
      resumeText: demoEmployee.resumeText,
      resumeSkills: demoEmployee.resumeSkills,
      jobDescription: techCorpJob1.description,
      role: techCorpJob1.title
    });

    const appAlexTechCorp = new Application({
      user: demoEmployee._id,
      job: techCorpJob1._id,
      employer: demoEmployer._id,
      company: techCorpJob1.company,
      role: techCorpJob1.title,
      location: techCorpJob1.location,
      workType: techCorpJob1.workType,
      status: 'Interviewing',
      priority: 'High',
      source: 'Platform Job Board',
      salary: techCorpJob1.salary,
      jobDescription: techCorpJob1.description,
      candidateName: demoEmployee.name,
      candidateEmail: demoEmployee.email,
      candidatePhone: '+1 (415) 555-0192',
      candidateResumeUrl: demoEmployee.resumeUrl,
      candidateResumeFileName: demoEmployee.resumeOriginalName,
      candidateCoverNote: 'I have spent the past 3 years building design token systems and high-throughput React applications. TechCorp Labs vision is a fantastic fit!',
      recruiterNotes: 'Candidate demonstrated exceptional state management architecture during initial phone screen. High conviction for final loop.',
      applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      matchedSkills: alexGapTechCorp.matchedSkills,
      missingSkills: alexGapTechCorp.missingSkills,
      matchScore: alexGapTechCorp.matchScore || 92,
      aiRecommendations: alexGapTechCorp.aiRecommendations,
      timeline: [
        { stage: 'Applied', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), note: 'Applied via Platform Job Board with uploaded resume' },
        { stage: 'Screening', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Recruiter Elena reviewed profile and scheduled screen' },
        { stage: 'Interviewing', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Advanced to technical systems pairing loop' }
      ]
    });
    await appAlexTechCorp.save();

    // Maya Lin applies to TechCorp Frontend Architect
    const appMayaTechCorp = new Application({
      user: candidate2._id,
      job: techCorpJob1._id,
      employer: demoEmployer._id,
      company: techCorpJob1.company,
      role: techCorpJob1.title,
      location: techCorpJob1.location,
      workType: techCorpJob1.workType,
      status: 'Screening',
      priority: 'High',
      source: 'Platform Job Board',
      salary: techCorpJob1.salary,
      jobDescription: techCorpJob1.description,
      candidateName: candidate2.name,
      candidateEmail: candidate2.email,
      candidatePhone: '+1 (206) 555-0144',
      candidateResumeUrl: candidate2.resumeUrl,
      candidateResumeFileName: candidate2.resumeOriginalName,
      candidateCoverNote: 'Excited about the design system challenges at TechCorp. My background in Next.js and web vitals aligns closely with your roadmap.',
      recruiterNotes: 'Impressive design system leadership at previous company. Reviewing availability for technical screening.',
      applicationDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      matchedSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
      missingSkills: ['Jest'],
      matchScore: 88,
      aiRecommendations: ['Strong design system credentials', 'Focus on microfrontend state hydration in interview'],
      timeline: [
        { stage: 'Applied', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: 'Applied via Platform Job Board' },
        { stage: 'Screening', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Application moved to Screening stage' }
      ]
    });
    await appMayaTechCorp.save();

    // Additional applications for Alex (External companies for his personal Kanban board)
    const externalApps = [
      {
        company: 'Stripe',
        role: 'Staff Full-Stack Engineer',
        location: 'San Francisco, CA (Hybrid)',
        workType: 'Hybrid',
        status: 'Offer',
        priority: 'High',
        source: 'Referral',
        salary: { min: 185000, max: 210000, currency: 'USD' },
        jobDescription: 'Stripe billing infrastructure leadership. Microservices, TypeScript, PostgreSQL, and high-throughput transaction consistency.',
        applicationDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Resolved',
        notes: 'Final written offer received! $195k base + equity.'
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
        jobDescription: 'User-facing AI applications. React, TypeScript, streaming WebSockets, Python, and low-latency token rendering.',
        applicationDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Pending',
        notes: 'System design round scheduled for this week.'
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
        jobDescription: 'Build guest experiences using React, TypeScript, accessibility, design systems, and web performance.',
        applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Pending',
        notes: 'Recruiter call completed. Follow-up reminder due today.'
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
        jobDescription: 'Cloud observability with Go, Docker, Kubernetes, PostgreSQL, and Linux telemetry.',
        applicationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        lastContactDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        followUpStatus: 'Pending',
        notes: 'Submitted 8 days ago.'
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
        jobDescription: 'Real-time collaborative workspace. TypeScript, React, WebSockets, WebAssembly, and Canvas algorithms.',
        applicationDate: new Date(),
        lastContactDate: new Date(),
        followUpStatus: 'Pending',
        notes: 'Preparing portfolio before applying.'
      }
    ];

    for (const appData of externalApps) {
      const gap = await analyzeSkillGap({
        resumeText: demoEmployee.resumeText,
        resumeSkills: demoEmployee.resumeSkills,
        jobDescription: appData.jobDescription,
        role: appData.role
      });

      const app = new Application({
        user: demoEmployee._id,
        ...appData,
        matchedSkills: gap.matchedSkills,
        missingSkills: gap.missingSkills,
        matchScore: gap.matchScore,
        aiRecommendations: gap.aiRecommendations,
        timeline: [
          { stage: 'Applied', date: appData.applicationDate, note: 'Submitted resume' },
          ...(appData.status !== 'Applied' && appData.status !== 'Wishlist'
            ? [{ stage: appData.status, date: new Date(), note: `Progressed to ${appData.status}` }]
            : [])
        ]
      });
      await app.save();
    }
    console.log('[Seed] Seeded applications across Employee and Employer pipelines.');

    // ==========================================
    // 6. SEED INTERVIEWS WITH RETROSPECTIVES
    // ==========================================
    const interviewTomorrow = new Date();
    interviewTomorrow.setDate(interviewTomorrow.getDate() + 1);
    interviewTomorrow.setHours(14, 0, 0, 0);

    const intTechCorp = new Interview({
      user: demoEmployee._id,
      application: appAlexTechCorp._id,
      company: 'TechCorp Labs',
      role: 'Senior React & TypeScript Frontend Architect',
      round: 'Technical Screen',
      scheduledAt: interviewTomorrow,
      durationMinutes: 60,
      interviewers: [
        { name: 'Elena Rostova', role: 'Head of Talent & Architecture' }
      ],
      meetingLink: 'https://meet.google.com/techcorp-frontend-arch',
      status: 'Scheduled',
      preparationNotes: 'Review concurrent rendering patterns, SSR hydration streaming, and custom hooks architecture.'
    });
    await intTechCorp.save();

    // ==========================================
    // 7. SEED QUESTION BANK
    // ==========================================
    const questions = [
      {
        user: demoEmployee._id,
        question: 'How does React 18 Concurrent Mode & Server Components differ from traditional SSR?',
        company: 'TechCorp / General',
        role: 'Senior Frontend Engineer',
        category: 'Technical',
        difficulty: 'Medium',
        answerKey: 'Server Components execute only on server with zero bundle impact. Concurrent Mode allows interruptible rendering via useTransition.',
        keyTakeaways: ['Zero client JS overhead', 'Time-slicing long renders without freezing UI'],
        timesPracticed: 3
      },
      {
        user: demoEmployee._id,
        question: 'Design a distributed rate limiter supporting 50,000 requests/sec across regional clusters.',
        company: 'Stripe',
        role: 'Staff Engineer',
        category: 'System Design',
        difficulty: 'Hard',
        answerKey: 'Token bucket or sliding window counter in Redis with Lua scripts for atomic increments. Multi-region partition strategy.',
        keyTakeaways: ['Sliding window counter prevents boundary spikes', 'Lua scripts guarantee atomicity'],
        timesPracticed: 5
      },
      {
        user: demoEmployee._id,
        question: 'Tell me about a time when you disagreed with a technical design decision. How did you resolve it?',
        company: 'General / Behavioral',
        role: 'Software Engineer',
        category: 'Behavioral',
        difficulty: 'Medium',
        answerKey: 'STAR Method: Situation (REST vs GraphQL migration), Task (prove latency tradeoffs), Action (built benchmarks), Result (team alignment).',
        keyTakeaways: ['Rely on benchmark data over subjective bias', 'Disagree and commit principle'],
        timesPracticed: 4
      }
    ];

    for (const q of questions) {
      await QuestionBank.create(q);
    }

    // ==========================================
    // 8. SEED NOTIFICATIONS
    // ==========================================
    await Notification.create({
      user: demoEmployee._id,
      type: 'UPCOMING_INTERVIEW',
      title: 'Interview Tomorrow: TechCorp Labs',
      message: 'Your Technical Screen for Senior React & TypeScript Frontend Architect is scheduled for tomorrow at 2:00 PM.',
      relatedInterview: intTechCorp._id,
      actionUrl: '/interviews',
      dueDate: interviewTomorrow
    });

    await Notification.create({
      user: demoEmployer._id,
      type: 'SYSTEM',
      title: 'New Candidate Application: Alex Rivera',
      message: 'Alex Rivera applied for "Senior React & TypeScript Frontend Architect" with a 92% ATS resume match score.',
      relatedApplication: appAlexTechCorp._id,
      actionUrl: '/employer/applicants'
    });

    console.log('[Seed] Database successfully seeded with Employee, Employer, and Admin modules!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
}

seedData();
