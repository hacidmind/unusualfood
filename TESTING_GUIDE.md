# Testing Guide - The Unusual Chop Planner

## Current Status

✅ **Backend**: Running on http://localhost:5000 (Test Mode - In-Memory Storage)  
✅ **Frontend**: Running on http://localhost:5176  
✅ **Database**: In-memory storage (data resets on server restart)
✅ **Authentication**: JWT tokens with local storage

## How to Start the Servers

### Terminal 1: Backend Server

```bash
cd server
npm start
```

Expected output:
```
⚠️ SERVER RUNNING IN TEST MODE (No MongoDB)
🍽️ Unusual Chop Planner server running on http://localhost:5000
✅ All endpoints are working!
```

### Terminal 2: Frontend Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v7.3.1  ready in XXXX ms
➜  Local:   http://localhost:5176/
```

---

## Full Login/Register Flow

### Step 1: Access the App

**Important**: Use a real browser (Chrome, Edge, Firefox, Safari) - NOT the VS Code Simple Browser

1. Open: **http://localhost:5176/**

You should see:
- 🍽️ Chop Planner logo
- Login form with Email and Password fields
- "Don't have an account? Register" link

### Step 2: Register a New Account

1. Click "Don't have an account? Register"
2. Fill in:
   - **Full Name**: Your name (e.g., "John Doe")
   - **Email**: Use any email (e.g., `test@example.com`)
   - **Password**: Any password (e.g., `test123`)
3. Click **Register** button

Expected:
- ✅ Form submits
- ✅ Page reloads
- ✅ You see the meal planner welcome screen with your name

### Step 3: You're Logged In!

After successful registration, you should see:

**Header Section**:
- 🍽️ The Unusual Chop Planner
- "Your weekly Lagos meal plan - eat well, live well"
- Your name: "Welcome, [Your Name]"
- Logout button

**Navigation Tabs**:
- "Meal Planner" (default selected)
- "My Profile"

**Planner Settings**:
- Weight-Loss Mode toggle button (OFF by default)
- Meal slot buttons: Breakfast, Lunch, Dinner (all enabled)

**Weekly Calendar**:
- 7 days: Monday through Sunday

**Daily Meal Cards**:
- Meal images, names, calorie counts, portions
- "How to cook" expandable sections

### Step 4: Test Profile Tab

1. Click **"My Profile"** tab
2. You should see:
   - Full Name input field
   - Adults input (default: 2)
   - Children input (default: 1)
   - Current Weight (default: 75 kg)
   - Weight Goal (default: 65 kg)
   - Diet Type dropdown (Mixed or Vegan)
   - Serving multiplier calculation
   - **Apply Profile** button

3. Make changes (e.g., increase adults to 3, select Vegan diet)
4. Click **Apply Profile**
5. Button should change to "✓ Profile Applied"

### Step 5: Test Meal Planner

1. Click **"Meal Planner"** tab
2. Available features:
   - **Weight-Loss Mode**: Click to toggle (changes button color)
   - **Day Selection**: Click any day to see that day's meals
   - **Meal Details**: Click "How to cook" to expand instructions
   - **Save Plan**: Click to save the meal plan (will show success message)

### Step 6: Logout

1. Click **Logout** button in header
2. Page reloads
3. You're back at login screen

---

## Troubleshooting

### Blank Screen After Login

1. **Open browser DevTools** (F12 or Right-click → Inspect)
2. Check the **Console** tab for errors
3. If you see CORS errors:
   - Make sure backend is running on port 5000
   - Check backend console for "✅ All endpoints working!"

4. **Check Network tab**:
   - Look for failed requests to `http://localhost:5000`
   - Should see successful requests to `/api/auth/register` or `/api/auth/login`

### Authentication Issues

**Issue**: "Failed to connect to server"
- ✅ Make sure backend is running: `npm start` in `/server` folder
- ✅ Check that port 5000 is available: `netstat -ano | findstr :5000`

**Issue**: "Email already registered"
- Try a different email address for registration

**Issue**: "Invalid email or password"
- Make sure you entered the correct credentials on login

### Styling Issues (Blank or Invisible Text)

1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Delete `node_modules/.vite` folder and restart frontend

---

## Manual API Testing (Advanced)

### Test Registration via Command Line

```powershell
$body = @{
  email = "test@example.com"
  password = "test123"
  fullName = "Test User"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Select-Object -ExpandProperty token
```

### Test Health Check

```powershell
Invoke-WebRequest http://localhost:5000/api/health -UseBasicParsing
```

---

## Features Overview

### Meal Planner Features
- 🍽️ 15 different meals (Mix of traditional & vegan African cuisine)
- 📊 Weight-loss mode (filters to only healthy meals)
- 👥 Household size calculator (adults + children)
- 📅 Weekly meal planning (Monday-Sunday)
- 💾 Save meal plans (stored in backend)
- 🍳 Detailed cooking instructions
- 🏃 Calorie tracking and portion sizing

### User Profile
- 👤 Name management
- ⚖️ Current weight tracking
- 🎯 Weight goal setting
- 🥗 Diet type preference (Mixed or Vegan)
- 👨‍👩‍👧‍👦 Household size (adults & children)
- 📈 Auto-calculated serving multiplier

---

## Data Persistence

**Current Mode**: In-Memory Storage (Test Mode)
- Data is stored while server is running
- ⚠️ Data resets when server restarts
- Perfect for testing and development

**Future**: MongoDB Integration
- When MongoDB is configured, data will persist permanently
- See `MONGODB_SETUP.md` for setup instructions

---

## Support

If you encounter issues:
1. Check that both backend and frontend are running
2. Use a real browser (not VS Code Simple Browser)
3. Check browser console (F12) for errors
4. Check backend terminal for server errors
5. Ensure ports 5000 (backend) and 5176 (frontend) are available
