require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { initScheduler } = require('./services/cronService');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const questionRoutes = require('./routes/questions');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_hunt_os';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Job Hunt OS API',
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
