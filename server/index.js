import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import User from './models/User.js';
import SavedPlan from './models/SavedPlan.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';
// Normalize frontend URL by trimming any trailing slash to prevent CORS mismatches
let FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
FRONTEND_URL = FRONTEND_URL.replace(/\/$/, '');

// Configure Google SMTP for password reset emails
let mailTransporter = null;
let sendMail;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  sendMail = async (msg) => {
    if (!mailTransporter) throw new Error('SMTP transporter not configured');
    return await mailTransporter.sendMail(msg);
  };
  if (NODE_ENV !== 'production') console.log('Google SMTP mailer configured');
} else {
  sendMail = null;
  if (NODE_ENV !== 'production') console.log('No SMTP credentials provided, password reset emails will be logged to console');
}

const MONGODB_URI = process.env.MONGODB_URI;
let dbEnabled = false;

if (MONGODB_URI) {
  if (NODE_ENV !== 'production') console.log('Attempting MongoDB connection...');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      dbEnabled = true;
      console.log('✅ MongoDB connected');
    })
    .catch((err) => {
      dbEnabled = false;
      console.error('❌ MongoDB connection failed:', err.message || err);
    });
} else {
  console.warn('⚠️  MONGODB_URI not set - using in-memory storage');
}

// In-memory fallbacks for development/testing
const users = {};
const savedPlans = {};
let userIdCounter = 1;
let planIdCounter = 1;

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    // In development, allow any localhost port
    if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(normalizedOrigin)) {
      return callback(null, true);
    }
    if (normalizedOrigin === FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Preflight handler for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbEnabled });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'The Unusual Chop Planner API running', dbEnabled });
});

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

// Helper functions that switch between MongoDB and in-memory storage
const findUserByEmail = async (email) => {
  if (dbEnabled) return await User.findOne({ email: email.toLowerCase() });
  return Object.values(users).find(u => u.email === email.toLowerCase());
};

const createUser = async ({ email, password, fullName }) => {
  if (dbEnabled) {
    const user = new User({ email: email.toLowerCase(), password, fullName });
    return await user.save();
  }
  const userId = String(userIdCounter++);
  users[userId] = {
    id: userId,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    fullName: fullName || 'User',
    currentWeight: 75,
    weightGoal: 65,
    dietType: 'Mixed',
    adultsCount: 2,
    childrenCount: 1,
    createdAt: new Date()
  };
  return users[userId];
};

const findUserById = async (id) => {
  if (dbEnabled) return await User.findById(id).select('-password');
  return users[id];
};

const updateUserById = async (id, updates) => {
  if (dbEnabled) {
    const user = await User.findById(id);
    if (!user) return null;
    Object.assign(user, updates);
    user.updatedAt = new Date();
    return await user.save();
  }
  const user = users[id];
  if (!user) return null;
  // If updating password in in-memory store, hash it first
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  Object.assign(user, updates);
  user.updatedAt = new Date();
  return user;
};

const savePlanForUser = async (userId, planName, meals) => {
  if (dbEnabled) {
    const plan = new SavedPlan({ userId, planName, meals, weeklyPlan: meals });
    return await plan.save();
  }
  const planId = String(planIdCounter++);
  savedPlans[planId] = {
    id: planId,
    userId,
    planName: planName || 'My Meal Plan',
    meals,
    weeklyPlan: meals,
    createdAt: new Date()
  };
  return savedPlans[planId];
};

const getPlansForUser = async (userId) => {
  if (dbEnabled) return await SavedPlan.find({ userId }).sort({ createdAt: -1 });
  return Object.values(savedPlans).filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const deletePlanById = async (planId, userId) => {
  if (dbEnabled) {
    const plan = await SavedPlan.findById(planId);
    if (!plan || String(plan.userId) !== String(userId)) return false;
    await plan.deleteOne();
    return true;
  }
  const plan = savedPlans[planId];
  if (!plan || plan.userId !== userId) return false;
  delete savedPlans[planId];
  return true;
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
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const created = await createUser({ email, password, fullName });

    const token = jwt.sign({ id: created.id || created._id, email: created.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: created.id || created._id,
        email: created.email,
        fullName: created.fullName || fullName
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

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let passwordValid = false;
    if (dbEnabled) {
      passwordValid = await user.comparePassword(password);
    } else {
      passwordValid = await bcrypt.compare(password, user.password);
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const id = user.id || user._id;
    const token = jwt.sign({ id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id,
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

// Forgot password (no-email demo)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await findUserByEmail(email);
    // Do not reveal whether the account exists.
    if (user) {
      // Create a short-lived token and send email (if SendGrid configured)
      const resetToken = jwt.sign({ id: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

      if (sendMail && process.env.SMTP_USER) {
        try {
          const msg = {
            to: email,
            from: process.env.SMTP_USER,
            subject: 'Reset your Unusual Chop Planner password',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
            html: `<p>You requested a password reset. Click the link below to reset your password (link expires in 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`
          };
          await sendMail(msg);
          if (NODE_ENV !== 'production') console.log('Sent password reset email to', email);
        } catch (err) {
          console.error('Failed to send reset email:', err?.message || err);
        }
      } else {
        // Fallback: log token for development
        console.log(`Password reset token for ${email}: ${resetToken}`);
      }
    }

    res.json({ message: 'If an account with that email exists, password reset instructions have been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// Reset password using token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword are required' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const userId = payload.id;
    if (!userId) return res.status(400).json({ error: 'Invalid token payload' });

    const updated = await updateUserById(userId, { password: newPassword });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get user profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id || user._id,
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

    const updates = { fullName, currentWeight, weightGoal, dietType, adultsCount, childrenCount };
    // Remove undefined keys
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const user = await updateUserById(req.userId, updates);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const responseUser = dbEnabled ? user.toObject() : { ...user };
    if (responseUser.password) delete responseUser.password;

    res.json({ message: 'Profile updated successfully', user: responseUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Save meal plan
app.post('/api/plans', verifyToken, async (req, res) => {
  try {
    const { planName, meals } = req.body;
    const saved = await savePlanForUser(req.userId, planName, meals);
    res.json({ message: 'Plan saved successfully', planId: saved.id || saved._id });
  } catch (error) {
    console.error('Plan save error:', error);
    res.status(500).json({ error: 'Failed to save plan', details: error.message });
  }
});

// Get user's saved plans
app.get('/api/plans', verifyToken, async (req, res) => {
  try {
    const userPlans = await getPlansForUser(req.userId);
    res.json(userPlans);
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Delete saved plan
app.delete('/api/plans/:planId', verifyToken, async (req, res) => {
  try {
    const ok = await deletePlanById(req.params.planId, req.userId);
    if (!ok) return res.status(404).json({ error: 'Plan not found' });
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
    mode: dbEnabled ? 'PRODUCTION (MongoDB enabled)' : 'TEST MODE (In-Memory Storage)',
    database: dbEnabled ? 'MongoDB - ENABLED' : 'MongoDB - DISABLED',
    note: dbEnabled ? 'Persistent storage is active' : 'Data will reset when server restarts. To enable MongoDB, set MONGODB_URI in server/.env'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️ Unusual Chop Planner server running on port ${PORT}`);
  if (NODE_ENV !== 'production') {
    console.log(`📊 Storage: ${dbEnabled ? 'MongoDB (Persistent)' : 'In-Memory (Test)'}`);
  }
});
