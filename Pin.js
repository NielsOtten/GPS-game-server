import mongoose from 'mongoose';

export default mongoose.model('Pin', {
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
  timestamp: {
    type: Date,
    default: () => new Date(),
  }
});