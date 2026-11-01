require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { initScheduler } = require('./src/services/cronService');

const authRoutes = require('./src/routes/auth');
const applicationRoutes = require('./src/routes/applications');
const interviewRoutes = require('./src/routes/interviews');
const questionRoutes = require('./src/routes/questions');
const analyticsRoutes = require('./src/routes/analytics');
const notificationRoutes = require('./src/routes/notifications');
const aiRoutes = require('./src/routes/ai');
const jobRoutes = require('./src/routes/jobs');
const resumeRoutes = require('./src/routes/resume');
const employerRoutes = require('./src/routes/employer');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_hunt_os';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Static files for uploaded resumes and assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Three Modules (Employee, Employer, Admin)
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Job Hunt OS API',
    status: 'online',
    version: '1.0.0',
    modules: ['Employee', 'Employer', 'Admin'],
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      employer: '/api/employer',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Job Hunt OS API (Employee, Employer, Admin modules)',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect Database & Start Server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[MongoDB] Connected successfully to ${MONGODB_URI}`);

    // Start background scheduled jobs
    initScheduler();

    app.listen(PORT, () => {
      console.log(`[Server] Job Hunt OS API is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
    process.exit(1);
  }
}

startServer();
