# GitHub Copilot Instructions for Glow Up UI

You are working on a Next.js application for tracking monthly "glow-up" routines for two users: Vallis and Kashina.

## Project Architecture

### Tech Stack
- **Next.js 16** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **localStorage** for client-side data persistence

### Key Components
- `app/page.tsx`: User selection landing page
- `app/dashboard/page.tsx`: Main dashboard with calendar view
- `app/customize/page.tsx`: Monthly routine customization
- `app/weekly/page.tsx`: Weekly check-ins and reflections
- `components/CalendarView.tsx`: Monthly calendar with completion tracking
- `components/DailyTasksView.tsx`: Daily task management interface

### Data Types
All types are defined in `types/routine.ts`:
- `User`: 'Vallis' | 'Kashina'
- `DailyRoutine`: Complete daily task structure with morning/health/night routines
- `MonthlyRoutineTemplate`: Customizable monthly routine template
- `WeeklyCheckIn`: Weekly goals and reflection data
- `DailyTask`: Individual task with id, text, and completed status

### Storage Layer
Located in `lib/storage.ts` using localStorage:
- Separate data for each user
- Functions follow pattern: `save*`, `get*`, `get*By*`
- All data is stored as JSON strings

## Code Patterns

### Client Components
All interactive components use `'use client'` directive:
```typescript
'use client';
import { useState, useEffect } from 'react';
```

### User Authentication
```typescript
useEffect(() => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    router.push('/');
  } else {
    setUser(currentUser);
  }
}, [router]);
```

### Data Persistence
- Load on mount, save immediately on change
- Always create new objects for state updates (immutability)
- Date keys use ISO format: `YYYY-MM-DD`
- Month keys use format: `YYYY-MM`

### Styling Conventions
- Vallis = Purple gradients (`from-purple-400 to-purple-600`)
- Kashina = Pink gradients (`from-pink-400 to-pink-600`)
- Always include dark mode variants
- Use semantic color classes: `bg-white dark:bg-gray-800`

## Key Features

### Monthly Customization
- Users can customize routines per month
- Templates stored in `MonthlyRoutineTemplate`
- Fallback to default tasks if no template exists
- Accessed via `/customize` page

### Task Management
- Three categories: Morning, Health Habits, Night
- Each task has unique ID, text, and completion status
- Progress calculated as percentage of completed tasks
- Special tracker for push-ups (0-100 goal)

### Calendar Visualization
- Color-coded by completion: Gray (0%), Red (<30%), Yellow (30-60%), Light Green (60-90%), Dark Green (90-100%)
- Click any day to view/edit tasks
- Automatic progress calculation from daily routines

## Common Operations

### Adding New Task Categories
1. Update `DailyRoutine` interface in `types/routine.ts`
2. Add to `MonthlyRoutineTemplate` interface
3. Update `DailyTasksView.tsx` to render new section
4. Add corresponding storage functions if needed

### Creating New Pages
1. Create `app/[name]/page.tsx` with `'use client'`
2. Include user authentication check
3. Add navigation link in dashboard header
4. Follow existing styling patterns

### Modifying Templates
- Edit `app/customize/page.tsx`
- Templates apply to entire month
- Saved per user, per month

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces from `types/routine.ts`
2. **Immutability**: Never mutate state directly, use spread operators
3. **Consistency**: Follow existing naming conventions and patterns
4. **Dark Mode**: Include dark variants for all new UI elements
5. **Accessibility**: Use semantic HTML and proper ARIA labels
6. **Responsive**: Test on mobile, tablet, and desktop viewports

## Testing Checklist
- [ ] User selection and persistence
- [ ] Navigation between pages
- [ ] Task completion and auto-save
- [ ] Calendar updates with completion percentages
- [ ] Both users maintain separate data
- [ ] Dark mode appearance
- [ ] Mobile responsiveness
- [ ] Monthly template customization

## Quick Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Important Notes
- All components requiring interactivity need `'use client'`
- Check `typeof window !== 'undefined'` in storage functions
- Date formatting must be consistent (ISO strings)
- localStorage has ~5-10MB limit
- Monthly templates override defaults when present
- Each user's data is completely isolated

When generating code, follow these patterns and maintain consistency with the existing codebase.
