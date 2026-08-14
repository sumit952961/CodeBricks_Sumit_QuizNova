import mongoose from 'mongoose';

const resetRequestSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('ResetRequest', resetRequestSchema);
