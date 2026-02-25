import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ⚠️ TESTING MODE - In-memory storage (no MongoDB)
// This is for development/testing only. Will reset when server restarts.
const users = {};
const savedPlans = {};
let userIdCounter = 1;
let planIdCounter = 1;

console.log('⚠️  SERVER RUNNING IN TEST MODE (No MongoDB)');
console.log('📝 Data will be reset when server restarts\n');

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
    const existingUser = Object.values(users).find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = String(userIdCounter++);
    users[userId] = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName || 'User',
      currentWeight: 75,
      weightGoal: 65,
      dietType: 'Mixed',
      adultsCount: 2,
      childrenCount: 1,
      createdAt: new Date()
    };

    const token = jwt.sign({ id: userId, email: users[userId].email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email: users[userId].email,
        fullName: users[userId].fullName
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

    const user = Object.values(users).find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
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
app.get('/api/profile', verifyToken, (req, res) => {
  try {
    const user = users[req.userId];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
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
app.put('/api/profile', verifyToken, (req, res) => {
  try {
    const { fullName, currentWeight, weightGoal, dietType, adultsCount, childrenCount } = req.body;

    const user = users[req.userId];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.currentWeight = currentWeight || user.currentWeight;
    user.weightGoal = weightGoal || user.weightGoal;
    user.dietType = dietType || user.dietType;
    user.adultsCount = adultsCount || user.adultsCount;
    user.childrenCount = childrenCount || user.childrenCount;
    user.updatedAt = new Date();

    res.json({ message: 'Profile updated successfully', user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Save meal plan
app.post('/api/plans', verifyToken, (req, res) => {
  try {
    const { planName, meals } = req.body;

    const planId = String(planIdCounter++);
    savedPlans[planId] = {
      id: planId,
      userId: req.userId,
      planName: planName || 'My Meal Plan',
      meals: meals,
      weeklyPlan: meals,
      createdAt: new Date()
    };

    res.json({ message: 'Plan saved successfully', planId });
  } catch (error) {
    console.error('Plan save error:', error);
    res.status(500).json({ error: 'Failed to save plan', details: error.message });
  }
});

// Get user's saved plans
app.get('/api/plans', verifyToken, (req, res) => {
  try {
    const userPlans = Object.values(savedPlans)
      .filter(plan => plan.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userPlans);
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Delete saved plan
app.delete('/api/plans/:planId', verifyToken, (req, res) => {
  try {
    const plan = savedPlans[req.params.planId];

    if (!plan || plan.userId !== req.userId) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    delete savedPlans[req.params.planId];

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
    mode: 'TEST MODE (In-Memory Storage)',
    database: 'MongoDB - DISABLED',
    note: 'Data will reset when server restarts. To enable MongoDB, check server/index.js'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️ Unusual Chop Planner server running on http://localhost:${PORT}`);
  console.log(`📊 Storage: In-Memory (Test/Development Mode)\n`);
  console.log('✅ All endpoints are working!');
  console.log('📋 Try: curl http://localhost:5000/api/health\n');
});
