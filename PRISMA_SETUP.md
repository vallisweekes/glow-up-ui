# Prisma + Neon Database Setup & Migration Guide

## 📋 Prerequisites
- [ ] Neon account created at [neon.tech](https://neon.tech)
- [ ] Database connection string copied
- [ ] `.env` file created (see below)

---

## 🚀 Quick Start

### 1. Create `.env` File
```bash
# Create .env in project root
DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require"
```

### 2. Choose Your Schema

**Option A: Use Simplified Schema (Recommended - matches current app)**
```bash
# Replace the current schema
mv prisma/schema.prisma prisma/schema-original.prisma
mv prisma/schema-simplified.prisma prisma/schema.prisma
```

**Option B: Keep Original Schema (requires more migration work)**
```bash
# Keep existing schema.prisma
# You'll need to create User records and update API logic
```

### 3. Run Prisma Setup
```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name initial_setup

# Optional: Open Prisma Studio to view data
npx prisma studio
```

---

## 🔄 Migration Steps (In-Memory → Prisma)

### Step 1: Test Database Connection
```bash
# Run this to verify Prisma works
npx prisma db push
npx prisma studio
```

### Step 2: Update `bff-store.ts` Imports

**Current (in-memory):**
```typescript
// lib/bff-store.ts
const dailyRoutinesStore = new Map<string, DailyRoutine>();
```

**After Migration:**
```typescript
// lib/bff-store.ts - Simply re-export Prisma functions
export {
  getDailyRoutine,
  saveDailyRoutine,
  getMonthlyRoutines,
  deleteDailyRoutine,
  getSharedTemplate,
  saveSharedTemplate,
  deleteSharedTemplate,
  getAllRoutines,
  getAllTemplates,
  getStoreStats,
} from './prisma-service';
```

### Step 3: Test Each Endpoint

**Test Daily Routines:**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test with curl
curl http://localhost:3000/api/routines/2026-02-07/Vallis
```

**Test Templates:**
```bash
curl http://localhost:3000/api/templates/2026-02
```

### Step 4: Verify RTK Query Integration
- Open app at `http://localhost:3000`
- Select a user (Vallis or Kashina)
- Complete some tasks
- Refresh page → data should persist
- Check Prisma Studio → see data in database

---

## 📝 Schema Comparison

### Current App Data Flow
```
User selects "Vallis" or "Kashina" (string)
  ↓
RTK Query calls API with user string
  ↓
API uses user string directly in queries
  ↓
BFF store uses Map with composite keys
```

### Simplified Schema (Recommended)
```prisma
model DailyRoutine {
  date String
  user String  // "Vallis" or "Kashina"
  @@unique([date, user])
}
```
✅ No migration needed - drop-in replacement

### Original Schema (More Work)
```prisma
model User {
  id   String @id
  name String @unique
}

model DailyRoutine {
  userId String
  user   User @relation(...)
}
```
⚠️ Requires creating User records and updating all API calls

---

## 🎯 Recommended Migration Path

### Phase 1: Database Setup (5 minutes)
```bash
# Use simplified schema
mv prisma/schema.prisma prisma/schema-original.prisma
mv prisma/schema-simplified.prisma prisma/schema.prisma

# Setup database
npx prisma generate
npx prisma migrate dev --name init
```

### Phase 2: Switch to Prisma (2 minutes)
```bash
# Update bff-store.ts to re-export prisma-service functions
# (See code example above)
```

### Phase 3: Test & Verify (5 minutes)
1. Start dev server: `npm run dev`
2. Open app and test task completion
3. Refresh page - data persists ✓
4. Open Prisma Studio - see data ✓

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
```bash
# Check DATABASE_URL in .env
# Make sure it includes ?sslmode=require for Neon
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Migration failed"
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Data not persisting after refresh
1. Check browser console for API errors
2. Open Prisma Studio - verify data is in DB
3. Check RTK Query cache invalidation

---

## 🎨 Optional: Seed Initial Data

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample template for March 2026
  await prisma.sharedTemplate.create({
    data: {
      month: '2026-03',
      title: 'March Goals',
      focus: 'Fitness & Wellness',
      morningRoutine: [
        { id: 'morning-1', text: 'Morning meditation' },
      ],
      healthHabits: [
        { id: 'health-1', text: 'Drink 8 glasses of water' },
      ],
      nightRoutine: [
        { id: 'night-1', text: 'Evening gratitude' },
      ],
      weeklyGoals: ['Exercise 3x per week', 'Read for 30 min daily'],
    },
  });

  console.log('✓ Seed data created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:
```bash
npx tsx prisma/seed.ts
```

---

## 📚 Next Steps After Setup

1. **Deploy to Production**
   - Vercel automatically detects Prisma
   - Add `DATABASE_URL` to Vercel environment variables
   
2. **Add Migrations Workflow**
   ```bash
   # Before pushing changes
   npx prisma migrate dev --name describe_change
   git add prisma/migrations
   ```

3. **Monitor Database**
   - Use Neon dashboard for metrics
   - Set up connection pooling if needed

4. **Backup Strategy**
   - Neon includes automatic backups
   - Export data: `npx prisma db pull`

---

## ✅ Verification Checklist

After setup, verify:
- [ ] `.env` file exists with DATABASE_URL
- [ ] `npx prisma generate` runs successfully
- [ ] Migration created tables in Neon
- [ ] Prisma Studio opens and shows empty tables
- [ ] Dev server starts without errors
- [ ] Can save daily routine via app
- [ ] Data persists after page refresh
- [ ] Prisma Studio shows saved data
