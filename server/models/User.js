import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      default: 'User',
      trim: true
    },
    currentWeight: { type: Number, default: 75 },
    weightGoal:    { type: Number, default: 65 },
    dietType: {
      type: String,
      enum: ['Mixed', 'Vegan'],
      default: 'Mixed'
    },
    adultsCount:   { type: Number, default: 2 },
    childrenCount: { type: Number, default: 1 }
  },
  { timestamps: true }   // auto-manages createdAt + updatedAt
);

// Hash password only when it changes
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Strip password from any JSON serialisation
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
