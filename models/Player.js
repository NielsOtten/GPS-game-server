import mongoose from 'mongoose';

export default mongoose.model('Player', {
  playerId: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  angle: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: () => new Date(),
  }
});