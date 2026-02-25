# The Unusual Chop Planner

A modern React-based meal planning app for Lagos, featuring user authentication, personalized meal plans, and African-centric recipes with weight loss and dietary preferences.

## Features

✅ **User Authentication** - Register and login securely  
✅ **Personalized Profiles** - Track weight, goals, and preferences  
✅ **Weekly Meal Plans** - Access carefully curated Lagos meals  
✅ **Weight Loss Mode** - Filter for healthy, low-calorie options  
✅ **Dietary Preferences** - Choose between Mixed or Vegan (African-centric)  
✅ **Household Customization** - Calculate portions for your family  
✅ **Save Plans** - Store your favorite meal combinations  

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS for styling

**Backend:**
- Node.js with Express
- SQLite database
- JWT authentication
- Password hashing with bcryptjs

## Installation & Setup

### Prerequisites
- Node.js (v20+)
- npm or yarn

### 1. Install Frontend Dependencies

```bash
cd unusualfood
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Start the Backend Server

```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. In a new terminal, start the Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Access the Application

Open your browser and go to `http://localhost:5173`

## First Use

1. **Register** an account with your email and password
2. **Configure** your profile:
   - Enter your household size (adults and children)
   - Set your current weight and weight goal
   - Choose your dietary preference (Mixed or Vegan)
3. **Explore** the meal planner with your preferences
4. **Toggle** weight loss mode to see healthier options
5. **Save** your favorite meal plans

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (server/.env)
```
PORT=5000
JWT_SECRET=your-secure-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Meal Plans
- `POST /api/plans` - Save a meal plan
- `GET /api/plans` - Get user's saved plans

### Health
- `GET /api/health` - Check server status

## Database Schema

### Users Table
```
- id (PRIMARY KEY)
- email (UNIQUE)
- password
- fullName
- currentWeight
- weightGoal
- dietType (Mixed/Vegan)
- adultsCount
- childrenCount
- createdAt
```

### Saved Plans Table
```
- id (PRIMARY KEY)
- userId (FOREIGN KEY)
- planName
- meals (JSON)
- createdAt
```

## Meal Categories

**Breakfast Options:**
- Pap (Ogi) and Moi Moi
- Yam and Egg Sauce
- Egg White Omelette and Whole Wheat Toast
- Akamu and Akara
- Smoothie Bowl with Fruits

**Lunch Options:**
- Ofada Rice and Ayamase (Light)
- Jollof Rice and Grilled Chicken
- Grilled Fish and Steamed Vegetables
- Eba and Light Egusi Soup
- Lentil and Vegetable Stew

**Dinner Options:**
- Efo Riro with Fish and Small Swallow
- Beans and Plantain
- Vegetable Soup with Lean Chicken
- Okra Soup with Fufu
- Roasted Vegetables and Quinoa

## Weight Loss Mode

When enabled, the app filters meals to show only weight-loss friendly options:
- Lower calorie meals (typically 250-430 kcal)
- Lean protein sources
- Vegetable-forward recipes
- Reduced oil usage

## Dietary Preferences

### Mixed (African)
Traditional Lagos cuisine with balanced nutrition

### Vegan (African)
Plant-based African recipes including:
- Beans and Plantain
- Smoothie Bowl
- Lentil and Vegetable Stew
- Roasted Vegetables and Quinoa

## Troubleshooting

**Backend won't connect?**
- Ensure backend is running on port 5000
- Check that both server and frontend are started

**Meals not updating after profile change?**
- Click "Apply Profile" button to save changes
- Wait a moment for queries to process

**Weight Loss Mode not working?**
- Ensure profile has been applied
- Check that selected meals have dietType matching your preference

## Future Enhancements

- Shopping list generator
- Nutrition tracking
- Recipe sharing with other users
- Mobile app version
- Integration with grocery delivery services
- Multi-language support

## Support

For issues or feature requests, please contact the development team.

## License

MIT License - See LICENSE file for details
