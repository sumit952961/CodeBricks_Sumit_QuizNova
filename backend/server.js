import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import questionRoutes from './routes/questionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes, { initialTests } from './routes/testRoutes.js';
import Question from './models/Question.js';
import User from './models/User.js';
import Test from './models/Test.js';
import ResetRequest from './models/ResetRequest.js';
import { initialQuestions } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_db';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tests', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    database: dbConnected ? 'MongoDB Connected' : 'In-Memory Engine (Fallback)',
    timestamp: new Date().toISOString()
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback all non-API GET requests to serve frontend SPA index.html
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Database Seed Function
const seedDatabaseIfNeeded = async () => {
  try {
    const testCount = await Test.countDocuments();
    if (testCount === 0) {
      await Test.insertMany(initialTests);
      console.log('🌱 Seeded MongoDB with default test categories');
    }

    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      await Question.insertMany(initialQuestions);
      console.log('🌱 Seeded MongoDB with default questions');
    }

    const adminUser = await User.findOne({ email: 'admin@quiznova.com' });
    if (!adminUser) {
      await User.create({
        name: 'System Admin',
        username: 'admin',
        email: 'admin@quiznova.com',
        password: 'adminpassword',
        mobileNumber: '9999999999',
        year: 'Graduated',
        role: 'admin'
      });
      console.log('🌱 Seeded MongoDB with default admin user (admin@quiznova.com / adminpassword)');
    }
  } catch (err) {
    console.error('Error during database seeding:', err.message);
  }
};

// Connect to MongoDB with fallback
const startServer = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000 // Fast timeout if MongoDB service is not running locally
    });
    console.log('✅ Successfully connected to MongoDB');
    await seedDatabaseIfNeeded();
  } catch (error) {
    console.log('⚠️ MongoDB connection not available. Operating with In-Memory Storage Engine.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 MERN Quiz Backend Server running on http://localhost:${PORT}`);
  });
};

startServer();

