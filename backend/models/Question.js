import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timeLimitSeconds: {
    type: Number,
    default: 15,
    min: 5,
    max: 120
  },
  explanation: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);
