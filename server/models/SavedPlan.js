import mongoose from 'mongoose';

const savedPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: {
    type: String,
    default: 'My Meal Plan'
  },
  meals: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  weeklyPlan: [
    {
      day: String,
      plan: [
        {
          slot: String,
          meal: {
            name: String,
            calories: Number,
            portion: String,
            dietType: String
          }
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SavedPlan', savedPlanSchema);
