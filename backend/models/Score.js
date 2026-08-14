import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTakenSeconds: {
    type: Number,
    default: 0
  },
  testName: {
    type: String,
    required: true,
    default: 'General'
  }
}, {
  timestamps: true
});

export default mongoose.model('Score', scoreSchema);
