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
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';
let FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// ─── Email ────────────────────────────────────────────────────────────────────
let sendMail = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  sendMail = (msg) => transporter.sendMail(msg);
  console.log('✉️  Google SMTP mailer configured');
}

// ─── In-memory fallback (used only when MONGODB_URI is missing) ───────────────
let dbEnabled = false;
const memUsers  = {};
const memPlans  = {};
let   memUserId = 1;
let   memPlanId = 1;

// ─── Mongoose helpers ─────────────────────────────────────────────────────────
const db = {
  findUserByEmail: async (email) =>
    dbEnabled
      ? User.findOne({ email: email.toLowerCase() })
      : Object.values(memUsers).find(u => u.email === email.toLowerCase()) ?? null,

  createUser: async ({ email, password, fullName }) => {
    if (dbEnabled) {
      return new User({ email, password, fullName }).save();
    }
    const id = String(memUserId++);
    memUsers[id] = {
      id, email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      fullName: fullName || 'User',
      currentWeight: 75, weightGoal: 65,
      dietType: 'Mixed', adultsCount: 2, childrenCount: 1,
      createdAt: new Date()
    };
    return memUsers[id];
  },

  findUserById: async (id) =>
    dbEnabled
      ? User.findById(id).select('-password')
      : memUsers[id] ?? null,

  updateUser: async (id, updates) => {
    if (dbEnabled) {
      const user = await User.findById(id);
      if (!user) return null;
      if (updates.password) {
        user.password = updates.password; // pre-save hook hashes it
        delete updates.password;
      }
      Object.assign(user, updates);
      return user.save();
    }
    const user = memUsers[id];
    if (!user) return null;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    Object.assign(user, updates, { updatedAt: new Date() });
    return user;
  },

  savePlan: async (userId, planName, weeklyPlan) => {
    if (dbEnabled) {
      return new SavedPlan({ userId, planName, weeklyPlan }).save();
    }
    const id = String(memPlanId++);
    memPlans[id] = { id, userId, planName: planName || 'My Meal Plan', weeklyPlan, createdAt: new Date() };
    return memPlans[id];
  },

  updatePlan: async (planId, userId, updates) => {
    if (dbEnabled) {
      const plan = await SavedPlan.findOne({ _id: planId, userId });
      if (!plan) return null;
      if (updates.planName  !== undefined) plan.planName  = updates.planName;
      if (updates.weeklyPlan !== undefined) plan.weeklyPlan = updates.weeklyPlan;
      return plan.save();
    }
    const plan = memPlans[planId];
    if (!plan || plan.userId !== userId) return null;
    Object.assign(plan, updates, { updatedAt: new Date() });
    return plan;
  },

  getPlans: async (userId) =>
    dbEnabled
      ? SavedPlan.find({ userId }).sort({ createdAt: -1 })
      : Object.values(memPlans)
          .filter(p => p.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  deletePlan: async (planId, userId) => {
    if (dbEnabled) {
      const plan = await SavedPlan.findOne({ _id: planId, userId });
      if (!plan) return false;
      await plan.deleteOne();
      return true;
    }
    const plan = memPlans[planId];
    if (!plan || plan.userId !== userId) return false;
    delete memPlans[planId];
    return true;
  }
};

// ─── Middleware ───────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const o = origin.replace(/\/$/, '');
    if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(o)) return cb(null, true);
    if (o === FRONTEND_URL) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/', (_, res) => res.json({ message: 'Unusual Chop Planner API', db: dbEnabled ? 'MongoDB' : 'In-Memory' }));
app.get('/health', (_, res) => res.json({ ok: true, db: dbEnabled ? 'MongoDB' : 'In-Memory' }));

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (await db.findUserByEmail(email)) return res.status(400).json({ error: 'Email already registered' });

    const user = await db.createUser({ email, password, fullName });
    const id = user.id || user._id;
    const token = jwt.sign({ id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Registration successful', token, user: { id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = dbEnabled
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const id = user.id || user._id;
    const token = jwt.sign({ id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful', token,
      user: { id, email: user.email, fullName: user.fullName, currentWeight: user.currentWeight, weightGoal: user.weightGoal, dietType: user.dietType, adultsCount: user.adultsCount, childrenCount: user.childrenCount }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await db.findUserByEmail(email);
    if (user) {
      const resetToken = jwt.sign({ id: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
      if (sendMail) {
        try {
          await sendMail({
            to: email, from: process.env.SMTP_USER,
            subject: 'Reset your Unusual Chop Planner password',
            text: `Reset link: ${resetLink}`,
            html: `<p>Click below to reset your password (expires in 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`
          });
        } catch (e) { console.error('Email send error:', e?.message); }
      } else {
        if (NODE_ENV !== 'production') console.log(`[DEV] Reset link for ${email}: ${resetLink}`);
      }
    }
    res.json({ message: 'If an account with that email exists, reset instructions have been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword are required' });

    let payload;
    try { payload = jwt.verify(token, JWT_SECRET); }
    catch { return res.status(400).json({ error: 'Invalid or expired token' }); }

    const updated = await db.updateUser(payload.id, { password: newPassword });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const u = dbEnabled ? user.toJSON() : { ...user };
    res.json({ id: u._id || u.id, email: u.email, fullName: u.fullName, currentWeight: u.currentWeight, weightGoal: u.weightGoal, dietType: u.dietType, adultsCount: u.adultsCount, childrenCount: u.childrenCount });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT profile
app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, currentWeight, weightGoal, dietType, adultsCount, childrenCount } = req.body;
    const updates = { fullName, currentWeight, weightGoal, dietType, adultsCount, childrenCount };
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const user = await db.updateUser(req.userId, updates);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const u = dbEnabled ? user.toJSON() : { ...user };
    res.json({ message: 'Profile updated successfully', user: u });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST plan
app.post('/api/plans', verifyToken, async (req, res) => {
  try {
    const { planName, meals } = req.body;
    const saved = await db.savePlan(req.userId, planName, meals);
    res.json({ message: 'Plan saved', planId: saved.id || saved._id, plan: saved });
  } catch (err) {
    console.error('Plan save error:', err);
    res.status(500).json({ error: 'Failed to save plan', details: err.message });
  }
});

// PUT plan (rename or update meals)
app.put('/api/plans/:planId', verifyToken, async (req, res) => {
  try {
    const { planName, meals } = req.body;
    const updates = {};
    if (planName  !== undefined) updates.planName   = planName;
    if (meals     !== undefined) updates.weeklyPlan = meals;

    const plan = await db.updatePlan(req.params.planId, req.userId, updates);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan updated', plan });
  } catch (err) {
    console.error('Plan update error:', err);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// GET plans
app.get('/api/plans', verifyToken, async (req, res) => {
  try {
    const plans = await db.getPlans(req.userId);
    res.json(plans);
  } catch (err) {
    console.error('Plans fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// DELETE plan
app.delete('/api/plans/:planId', verifyToken, async (req, res) => {
  try {
    const ok = await db.deletePlan(req.params.planId, req.userId);
    if (!ok) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    console.error('Plan delete error:', err);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// ─── Start: wait for MongoDB before accepting connections ─────────────────────
async function start() {
  if (process.env.MONGODB_URI) {
    console.log('🔌 Connecting to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      dbEnabled = true;
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);
      console.warn('⚠️  Falling back to in-memory storage');
    }
  } else {
    console.warn('⚠️  MONGODB_URI not set — using in-memory storage (data resets on restart)');
  }

  app.listen(PORT, () => {
    console.log(`🍽️  Server running on port ${PORT}`);
    console.log(`📦 Storage: ${dbEnabled ? 'MongoDB (persistent)' : 'In-Memory (temporary)'}`);
  });
}

start();
