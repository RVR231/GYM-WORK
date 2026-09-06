# RVR_GYM — Fast, Modern Personal Gym Tracker

**RVR_GYM** is a high-performance personal gym tracking web application designed specifically for quick, effortless logging inside the gym between sets.

Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**.

---

## ⚡ Core Features

- **Automatic Daily Schedule**:
  - **Monday**: Push
  - **Tuesday**: Pull
  - **Wednesday**: Legs
  - **Thursday**: Push
  - **Friday**: Pull
  - **Saturday**: Legs
  - **Sunday**: Dedicated **Rest Day** screen with recovery guidance (no automatic workout suggested, with manual override option).
- **Manual Override**: Easily switch today's workout if you missed a session or want to swap days.
- **Fast Individual Set Logging**:
  - Every set has its own **Weight (KG)** and **Repetitions** input.
  - Large tap targets and quick `+` / `-` steppers optimized for gym mobile screens.
  - `+ Add Set`, delete set, or `Skip Exercise` (skipped exercises are excluded from the saved workout log).
  - Clean rest stopwatch between sets with audible notification.
- **Cardio Section**:
  - Running, Cycling, Incline Walk.
  - Simple YES / NO toggle and minutes duration.
- **Body Weight Tracker**:
  - Daily weigh-in logger with quick `+` / `-` steppers on the dashboard.
  - Interactive Body Weight progress line graph.
- **Workout History**:
  - Monthly interactive calendar with workout indicators.
  - Click any date to view exercises, exact sets (`20 KG × 10`), and completed cardio.
  - Full edit and delete capabilities for saved workouts.
  - Search filter to look up past exercises or workout dates.
- **Progress Section**:
  - Select any exercise to view your strength progression curve over time.
  - Personal Best (PR) and session count tracking.
  - Chronological list of past session top weights.
- **Exercise Management**:
  - Add custom exercises, rename existing ones, or change workout category (Push, Pull, Legs).
  - Pre-seeded with complete factory default templates for Push, Pull, and Legs.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!TIP]
> RVR_GYM works immediately out-of-the-box in **Local Storage mode** without needing any API keys. You can start logging workouts and body weight right away!

---

## ☁️ Supabase Cloud Setup & Google Sign-In

To enable cloud synchronization and Google Sign-In so you can access the same data across your phone and laptop:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In your project settings, copy your **Project URL** and **anon / public key**.

### Step 2: Configure `.env`
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run the Database Schema
1. In the Supabase Dashboard, go to **SQL Editor**.
2. Open the file `supabase/schema.sql` in this project, paste its contents, and click **Run**.
3. This creates all tables (`workouts`, `workout_exercises`, `workout_sets`, `workout_cardio`, `body_weights`, `custom_exercises`) with **Row Level Security (RLS)** ensuring each user can only read and write their own data.

### Step 4: Enable Google Authentication
1. In Supabase Dashboard, go to **Authentication > Providers > Google**.
2. Toggle **Enable Google provider**.
3. Add your Google OAuth Client ID and Secret (from Google Cloud Console).
4. In Google Cloud Console, add `https://<your-project-id>.supabase.co/auth/v1/callback` as an Authorized Redirect URI.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and import your repository.
3. In the project settings on Vercel:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Your app will be live with full mobile PWA capabilities!
