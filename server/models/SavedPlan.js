import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    calories: { type: Number },
    portion:  { type: String },
    dietType: { type: String }
  },
  { _id: false }
);

const slotSchema = new mongoose.Schema(
  {
    slot: { type: String, required: true },
    meal: { type: mealSchema, required: true }
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    day:  { type: String, required: true },
    plan: { type: [slotSchema], default: [] }
  },
  { _id: false }
);

const savedPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    planName:   { type: String, default: 'My Meal Plan', trim: true },
    weeklyPlan: { type: [dayPlanSchema], default: [] }
  },
  { timestamps: true }   // auto-manages createdAt + updatedAt
);

export default mongoose.model('SavedPlan', savedPlanSchema);
