import mongoose from 'mongoose';

export default mongoose.model('Location', {
  lat: {
    type:Number,
    required: true
  },
  long: {
    type:Number,
    required: true
  },
  accuracy: {
    type:Number,
    required: true
  },
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'Player'
  },
  timestamp: {
    type: Date,
    default: () => new Date(),
  }
});