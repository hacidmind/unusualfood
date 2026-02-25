import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';
import SavedPlan from './models/SavedPlan.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Make sure your MONGODB_URI in .env is correct');
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName: fullName || 'User'
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        currentWeight: user.currentWeight,
        weightGoal: user.weightGoal,
        dietType: user.dietType,
        adultsCount: user.adultsCount,
        childrenCount: user.childrenCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      currentWeight: user.currentWeight,
      weightGoal: user.weightGoal,
      dietType: user.dietType,
      adultsCount: user.adultsCount,
      childrenCount: user.childrenCount
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, currentWeight, weightGoal, dietType, adultsCount, childrenCount } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        currentWeight,
        weightGoal,
        dietType,
        adultsCount,
        childrenCount,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Save meal plan
app.post('/api/plans', verifyToken, async (req, res) => {
  try {
    const { planName, meals } = req.body;

    const plan = new SavedPlan({
      userId: req.userId,
      planName: planName || 'My Meal Plan',
      meals: meals,
      weeklyPlan: meals
    });

    await plan.save();

    res.json({ message: 'Plan saved successfully', planId: plan._id });
  } catch (error) {
    console.error('Plan save error:', error);
    res.status(500).json({ error: 'Failed to save plan', details: error.message });
  }
});

// Get user's saved plans
app.get('/api/plans', verifyToken, async (req, res) => {
  try {
    const plans = await SavedPlan.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Delete saved plan
app.delete('/api/plans/:planId', verifyToken, async (req, res) => {
  try {
    const plan = await SavedPlan.findOneAndDelete({
      _id: req.params.planId,
      userId: req.userId
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Plan delete error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️ Unusual Chop Planner server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${MONGODB_URI ? 'MongoDB Atlas' : 'Not configured'}`);
});
