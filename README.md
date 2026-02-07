# Glow Up Journey - Monthly Progress Tracker

A beautiful web application for **Vallis** and **Kashina** to track their monthly glow-up routines, complete daily tasks, and monitor their progress together.

## 🌟 Features

### 🏠 User Selection
- Beautiful landing page where users can select their profile (Vallis or Kashina)
- Personalized colors and themes for each user

### 📅 Calendar View
- Interactive monthly calendar displaying daily completion percentages
- Color-coded progress indicators:
  - Gray: Not started (0%)
  - Red: < 30% completion
  - Yellow: 30-60% completion
  - Light Green: 60-90% completion
  - Dark Green: 90-100% completion
- Visual tracking of daily progress across the entire month

### ✅ Daily Routine Tasks

#### Morning Routine
- Prayers / Affirmations / 5-minute meditation or yoga stretching
- 10-15 mins listen to Eric Thomas or Les Brown
- Oil pulling
- Drink clove tea (on an empty stomach)

#### Daily Health Habits
- Drink 8-10 cups of water
- Take supplements
- No sugar or unhealthy snacking
- Limited / no alcohol
- 10,000 steps completed
- Teeth whitening strips
- Push-ups tracker (with progress bar to 100 goal)

#### Daily Nutrition Check-In
- Track breakfast, lunch, and dinner
- Guidelines: Protein focused • Fruits & vegetables • No bread unless sourdough

#### Night Routine
- Nightly prayers/affirmations
- Gratitude or reflection moment

### 📊 Weekly Check-Ins
- Navigate through weeks 1-4 of the month
- Track weekly goals:
  - Exercised at least 2 times a week
  - Mental health check-in (journal or talk)
  - Self-presentation & self care action (Health MOT, dental hygiene cleaning, nails)
- Weekly reflection prompts:
  - One win this week
  - One thing I'm proud of
  - One thing to improve next week

### 🎨 Monthly Routine Customization
- **NEW**: Customize routines for each month separately
- Edit routine title and focus areas (Mental • Physical • Spiritual)
- Add, edit, or remove tasks in any category
- Create custom weekly goals
- Set monthly reading goals
- Templates are saved per user, per month
- Falls back to default routine if no template exists

### 💾 Data Persistence
- All data is saved to browser localStorage
- Progress persists across sessions
- Separate data tracking for each user

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Technology Stack

- **Framework**: Next.js 16 (React 19)
- **Laustomize Monthly Routine** (Optional): Click "Customize Month" to personalize tasks for specific months
4. **Complete Daily Tasks**: Click on any day to view and complete your daily routine tasks
5. **Track Nutrition**: Log your meals and ensure you're following the nutrition guidelines
6. **Weekly Check-Ins**: Navigate to Weekly Check-Ins to reflect on your progress and set goals
7. **Switch Users**: Use the "Switch User" button to change between Vallis and Kashina

## 🎨 Customization

### Creating Monthly Templates
Each month can have its own unique routine! To customize:
1. Click the "Customize Month" button in the dashboard
2. Select the month you want to customize
3. Edit the routine title and focus areas
4. Add, edit, or remove tasks in any category (Morning, Health, Night)
5. Customize weekly goals
6. Set a reading goal for the month
7. Save your template

Your customized routine will automatically apply to all days in that month. You can create different routines for different months (e.g., February focused on fitness, March focused on mental health).

## 📱 Usage

1. **Select Your Profile**: On the landing page, click on either "Vallis" or "Kashina" to start
2. **View Calendar**: See your monthly progress at a glance with color-coded completion indicators
3. **Complete Daily Tasks**: Click on any day to view and complete your daily routine tasks
4. **Track Nutrition**: Log your meals and ensure you're following the nutrition guidelines
5. **Weekly Check-Ins**: Navigate to Weekly Check-Ins to reflect on your progress and set goals
6. **Switch Users**: Use the "Switch User" button to change between Vallis and Kashina

## 🎯 Daily Routine Structure

### Focus Areas
- **Mental**: Meditation, affirmations, gratitude
- **Physical**: Exercise, nutrition, hydration, push-ups
- **Spiritual**: Prayers, reflection, personal growth

### Progress Tracking
- Export monthly progress as PDF report
- Photo upload for progress tracking
- Shared notes between users for weekly talks
- Push notifications for daily reminders
- Analytics and trends over time
- Habit streak tracking
- Motivational quotes integration
- Data is stored locally in your browser
- Clear browser data will reset all progress
- Each user (Vallis and Kashina) has separate data tracking
- Works on desktop and mobile devices

## 🔮 Future Enhancements

Potential features to add:
- Monthly reading goal tracker
- Photo upload for progress tracking
- Export data as PDF report
- Shared notes between users
- Push notifications for daily reminders
- Dark mode improvements
- Analytics and trends over time

---

**Made with 💜 and 💗 for a healthier, happier you!**

