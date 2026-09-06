-- ==============================================================================
-- RVR_GYM: Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- It creates all required tables with strict Row-Level Security so that:
-- 1. Each user's workouts, weight logs, and custom exercises are 100% private.
-- 2. No user can ever read, update, or delete another user's data.
-- ==============================================================================

-- 1. Profiles Table (Automatically synced from Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Body Weight Logs Table
create table if not exists public.body_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  weight_kg numeric(5, 2) not null,
  logged_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_date_weight unique (user_id, logged_date)
);

alter table public.body_weights enable row level security;

create policy "Users can manage own body weights"
  on public.body_weights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_body_weights_user_date 
  on public.body_weights(user_id, logged_date desc);

-- 3. Workouts Table
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  workout_type text not null, -- 'PUSH', 'PULL', 'LEGS', etc.
  workout_date date not null default current_date,
  duration_minutes integer default 0,
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workouts enable row level security;

create policy "Users can manage own workouts"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_workouts_user_date 
  on public.workouts(user_id, workout_date desc);

-- 4. Workout Exercises Table
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  exercise_name text not null,
  category text not null, -- 'Chest', 'Back', 'Biceps', etc.
  order_index integer default 0 not null
);

alter table public.workout_exercises enable row level security;

create policy "Users can manage own workout exercises"
  on public.workout_exercises for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_workout_exercises_workout 
  on public.workout_exercises(workout_id);

-- 5. Workout Sets Table (Every set has individual weight and reps)
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid references public.workout_exercises(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  set_number integer not null,
  weight_kg numeric(6, 2) not null,
  reps integer not null
);

alter table public.workout_sets enable row level security;

create policy "Users can manage own workout sets"
  on public.workout_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_workout_sets_exercise 
  on public.workout_sets(workout_exercise_id);

-- 6. Workout Cardio Table
create table if not exists public.workout_cardio (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  activity text not null, -- 'Running', 'Cycling', 'Incline Walk'
  completed boolean default false not null,
  duration_minutes integer default 0 not null
);

alter table public.workout_cardio enable row level security;

create policy "Users can manage own workout cardio"
  on public.workout_cardio for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_workout_cardio_workout 
  on public.workout_cardio(workout_id);

-- 7. Custom Exercises Table
create table if not exists public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  category text not null,
  workout_type text not null, -- 'PUSH', 'PULL', 'LEGS'
  is_deleted boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.custom_exercises enable row level security;

create policy "Users can manage own custom exercises"
  on public.custom_exercises for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 8. Auth Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
