# MongoDB Setup Guide - The Unusual Chop Planner

## ✅ What Has Been Done

1. ✅ **Updated package.json** - Added Mongoose and validator dependencies
2. ✅ **Created Mongoose Models:**
   - `server/models/User.js` - User schema with password hashing
   - `server/models/SavedPlan.js` - Saved meal plans schema
3. ✅ **Updated server/index.js** - Completely refactored to use MongoDB with Mongoose
4. ✅ **Updated .env file** - Added placeholder for MONGODB_URI

## 🔧 Next Steps: Add Your MongoDB URI

### Step 1: Get Your MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in with your account
3. Select your **Cluster**
4. Click **"Connect"** button
5. Choose **"Drivers"** (not MongoDB Compass)
6. Copy your connection string

### Step 2: Where to Add Your MongoDB URI

**File:** `server/.env`

**Current Content:**
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER_NAME.mongodb.net/YOUR_DATABASE_NAME?retryWrites=true&w=majority
```

**Replace the MONGODB_URI line with your actual connection string:**

Example:
```env
MONGODB_URI=mongodb+srv://admin:myPassword123@cluster0.abc123.mongodb.net/chop-planner?retryWrites=true&w=majority
```

### Step 3: Install Dependencies

In the `server` directory, run:
```bash
npm install
```

This will install:
- ✅ **mongoose** ^7.6.0 - MongoDB ODM
- ✅ **validator** ^13.11.0 - Data validation
- ✅ **express** ^4.18.2
- ✅ **bcryptjs** ^2.4.3
- ✅ **jsonwebtoken** ^9.0.0
- ✅ **cors** ^2.8.5
- ✅ **dotenv** ^16.0.3

### Step 4: Start the Server

```bash
npm start
```

Or for development:
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🍽️ Unusual Chop Planner server running on http://localhost:5000
```

## 📊 MongoDB Collections

When you run the server for the first time, Mongoose will automatically create:

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  currentWeight: Number,
  weightGoal: Number,
  dietType: String ("Mixed" or "Vegan"),
  adultsCount: Number,
  childrenCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. SavedPlans Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  planName: String,
  meals: Mixed (flexible meal data),
  weeklyPlan: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## ⚠️ Troubleshooting

**Error: "Failed to connect to MongoDB"**
- ✓ Check your MONGODB_URI is correct in `.env`
- ✓ Copy the entire `mongodb+srv://...` string including `?retryWrites=true&w=majority`
- ✓ Ensure password doesn't contain special characters (or URL-encode them)

**Error: "Connect ECONNREFUSED"**
- ✓ Ensure MongoDB Atlas cluster is running
- ✓ Check IP whitelist in MongoDB Atlas allows your connection

**Error: "Authentication failed"**
- ✓ Verify username and password are correct
- ✓ Special characters in password need to be URL-encoded

## 🔒 Security Tips

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Change JWT_SECRET** - Use a strong random string
3. **Use MongoDB IP Whitelist** - Only allow known IPs in MongoDB Atlas
4. **Create a dedicated database user** - Don't use the admin account

## 📝 File Structure

```
server/
├── index.js              # Main server file (now uses Mongoose)
├── package.json          # Updated with Mongoose
├── .env                  # ← ADD YOUR MONGODB_URI HERE
├── models/
│   ├── User.js          # User schema with methods
│   └── SavedPlan.js     # Meal plan schema
└── README.md            # Detailed setup instructions
```

## ✅ Verification

After setup, test the connection with:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "database": "Connected"
}
```

---

**Next:** Run your frontend and backend servers together and register your first account! 🎉
