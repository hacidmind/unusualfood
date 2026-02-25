# The Unusual Chop Planner - Backend Server

Backend API for managing user accounts and meal plans with MongoDB integration.

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Configure MongoDB Connection

The server uses MongoDB Atlas. Follow these steps:

**Step 1: Get your MongoDB URI from MongoDB Atlas**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Select your Cluster
4. Click "Connect"
5. Choose "Drivers"
6. Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)

**Step 2: Add MongoDB URI to .env file**

Open `server/.env` and replace the placeholder:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER_NAME.mongodb.net/YOUR_DATABASE_NAME?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` - Your MongoDB database user username
- `YOUR_PASSWORD` - Your MongoDB database user password
- `YOUR_CLUSTER_NAME` - Your cluster name (e.g., `cluster0`)
- `YOUR_DATABASE_NAME` - Your database name (e.g., `chop-planner`)

**Example:**
```env
MONGODB_URI=mongodb+srv://admin:myPassword123@cluster0.abc123.mongodb.net/chop-planner?retryWrites=true&w=majority
```

### 3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Database Collections

The app creates two main collections:

### Users Collection
- `email` - User's email (unique)
- `password` - Hashed password
- `fullName` - User's full name
- `currentWeight` - Current weight in kg
- `weightGoal` - Target weight in kg
- `dietType` - Dietary preference (Mixed/Vegan)
- `adultsCount` - Number of adults in household
- `childrenCount` - Number of children in household
- `createdAt` - Account creation date

### SavedPlans Collection
- `userId` - Reference to user who created the plan
- `planName` - Name of the meal plan
- `meals` - Full meal plan data
- `weeklyPlan` - Structured weekly plan
- `createdAt` - Plan creation date

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register a new user
  - Body: `{ email, password, fullName }`
  
- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`

### Profile
- **GET** `/api/profile` - Get user profile (requires auth token)
- **PUT** `/api/profile` - Update user profile (requires auth token)
  - Body: `{ fullName, currentWeight, weightGoal, dietType, adultsCount, childrenCount }`

### Meal Plans
- **POST** `/api/plans` - Save a meal plan (requires auth token)
  - Body: `{ planName, meals }`
  
- **GET** `/api/plans` - Get user's saved plans (requires auth token)

- **DELETE** `/api/plans/:planId` - Delete a saved plan (requires auth token)

### Health
- **GET** `/api/health` - Check server status and database connection

## Authentication

Include JWT token in request header:
```
Authorization: Bearer <your_jwt_token>
```

## Environment Variables

```
PORT=5000                           # Server port
JWT_SECRET=your-secret-key          # JWT signing secret
MONGODB_URI=mongodb+srv://...       # MongoDB Atlas connection string
```

## Troubleshooting

**"Failed to connect to MongoDB"**
- Check your MONGODB_URI is correct
- Ensure your MongoDB user has permission to access the database
- Verify network access is allowed in MongoDB Atlas (IP Whitelist)

**"Invalid email or password"**
- Ensure credentials are correct
- Check the database has the user record

**"No token provided"**
- Add the JWT token to Authorization header when calling protected endpoints

