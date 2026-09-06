import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  CompletedWorkout, 
  BodyWeightLog, 
  ExerciseDefinition,
  WorkoutCategory 
} from '../types';
import { DEFAULT_EXERCISES } from '../constants/defaultExercises';

const WORKOUTS_KEY = 'rvr_gym_workouts_v1';
const WEIGHTS_KEY = 'rvr_gym_weights_v1';
const EXERCISES_KEY = 'rvr_gym_exercises_v1';

// Seed sample initial data if empty so user has an immediate live view
function initializeLocalData() {
  if (!localStorage.getItem(WORKOUTS_KEY)) {
    const today = new Date();
    const formatDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const initialWorkouts: CompletedWorkout[] = [
      {
        id: 'seed-push-1',
        workoutType: 'PUSH',
        date: formatDate(3),
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        exercises: [
          {
            name: 'Incline Bench Press',
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, weightKg: 20, reps: 10 },
              { setNumber: 2, weightKg: 20, reps: 10 },
              { setNumber: 3, weightKg: 20, reps: 8 },
            ]
          },
          {
            name: 'Cable Chest Fly',
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, weightKg: 32, reps: 12 },
              { setNumber: 2, weightKg: 32, reps: 10 },
              { setNumber: 3, weightKg: 32, reps: 10 },
            ]
          },
          {
            name: 'Lateral Raises',
            muscleGroup: 'Shoulders',
            sets: [
              { setNumber: 1, weightKg: 10, reps: 15 },
              { setNumber: 2, weightKg: 10, reps: 12 },
              { setNumber: 3, weightKg: 10, reps: 12 },
            ]
          },
          {
            name: 'Cable Triceps Pushdown',
            muscleGroup: 'Triceps',
            sets: [
              { setNumber: 1, weightKg: 25, reps: 12 },
              { setNumber: 2, weightKg: 25, reps: 10 },
              { setNumber: 3, weightKg: 25, reps: 10 },
            ]
          }
        ],
        cardio: [
          { activity: 'Incline Walk', completed: true, durationMinutes: 20 },
          { activity: 'Running', completed: false, durationMinutes: 0 },
          { activity: 'Cycling', completed: false, durationMinutes: 0 },
        ]
      },
      {
        id: 'seed-pull-1',
        workoutType: 'PULL',
        date: formatDate(2),
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        exercises: [
          {
            name: 'Lat Pulldown',
            muscleGroup: 'Back',
            sets: [
              { setNumber: 1, weightKg: 50, reps: 10 },
              { setNumber: 2, weightKg: 50, reps: 10 },
              { setNumber: 3, weightKg: 55, reps: 8 },
            ]
          },
          {
            name: 'Seated Cable Row',
            muscleGroup: 'Back',
            sets: [
              { setNumber: 1, weightKg: 45, reps: 10 },
              { setNumber: 2, weightKg: 45, reps: 10 },
              { setNumber: 3, weightKg: 45, reps: 8 },
            ]
          },
          {
            name: 'Bicep Curls',
            muscleGroup: 'Biceps',
            sets: [
              { setNumber: 1, weightKg: 14, reps: 12 },
              { setNumber: 2, weightKg: 14, reps: 10 },
              { setNumber: 3, weightKg: 14, reps: 10 },
            ]
          }
        ],
        cardio: [
          { activity: 'Running', completed: true, durationMinutes: 15 },
          { activity: 'Cycling', completed: false, durationMinutes: 0 },
          { activity: 'Incline Walk', completed: false, durationMinutes: 0 },
        ]
      }
    ];

    const initialWeights: BodyWeightLog[] = [
      { id: 'w-1', weightKg: 73.2, date: formatDate(6), createdAt: new Date().toISOString() },
      { id: 'w-2', weightKg: 73.0, date: formatDate(4), createdAt: new Date().toISOString() },
      { id: 'w-3', weightKg: 72.8, date: formatDate(2), createdAt: new Date().toISOString() },
      { id: 'w-4', weightKg: 72.5, date: formatDate(0), createdAt: new Date().toISOString() },
    ];

    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(initialWorkouts));
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(initialWeights));
  }
}

initializeLocalData();

export const StorageService = {
  // ==================== WORKOUTS ====================
  async getWorkouts(): Promise<CompletedWorkout[]> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: workouts, error } = await supabase
            .from('workouts')
            .select(`
              id,
              workout_type,
              workout_date,
              duration_minutes,
              notes,
              created_at,
              workout_exercises (
                id,
                exercise_name,
                category,
                order_index,
                workout_sets (
                  id,
                  set_number,
                  weight_kg,
                  reps
                )
              ),
              workout_cardio (
                id,
                activity,
                completed,
                duration_minutes
              )
            `)
            .order('workout_date', { ascending: false });

          if (!error && workouts) {
            return workouts.map((w: any) => ({
              id: w.id,
              userId: user.id,
              workoutType: w.workout_type as WorkoutCategory,
              date: w.workout_date,
              durationMinutes: w.duration_minutes,
              notes: w.notes,
              createdAt: w.created_at,
              exercises: (w.workout_exercises || [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((ex: any) => ({
                  name: ex.exercise_name,
                  muscleGroup: ex.category,
                  sets: (ex.workout_sets || [])
                    .sort((a: any, b: any) => a.set_number - b.set_number)
                    .map((s: any) => ({
                      setNumber: s.set_number,
                      weightKg: Number(s.weight_kg),
                      reps: Number(s.reps),
                    }))
                })),
              cardio: (w.workout_cardio || []).map((c: any) => ({
                activity: c.activity,
                completed: c.completed,
                durationMinutes: c.duration_minutes,
              }))
            }));
          }
        } catch (e) {
          console.warn('Supabase fetch failed, falling back to local', e);
        }
      }
    }

    // Local fallback
    try {
      const stored = localStorage.getItem(WORKOUTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async saveWorkout(workout: Omit<CompletedWorkout, 'id' | 'createdAt'>): Promise<CompletedWorkout> {
    const id = 'wkt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newWorkout: CompletedWorkout = {
      ...workout,
      id,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage first for instant responsiveness
    const current = await this.getLocalWorkouts();
    // Filter out if any exists for the same id or prepend
    const updated = [newWorkout, ...current.filter(w => w.id !== id)];
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));

    // If Supabase is connected and user is logged in, sync to cloud
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: wRecord, error: wError } = await supabase
            .from('workouts')
            .insert({
              user_id: user.id,
              workout_type: workout.workoutType,
              workout_date: workout.date,
              duration_minutes: workout.durationMinutes || 0,
              notes: workout.notes || '',
            })
            .select('id')
            .single();

          if (!wError && wRecord) {
            const wId = wRecord.id;
            for (let i = 0; i < workout.exercises.length; i++) {
              const ex = workout.exercises[i];
              const { data: exRecord } = await supabase
                .from('workout_exercises')
                .insert({
                  workout_id: wId,
                  user_id: user.id,
                  exercise_name: ex.name,
                  category: ex.muscleGroup,
                  order_index: i,
                })
                .select('id')
                .single();

              if (exRecord) {
                const setsToInsert = ex.sets.map(s => ({
                  workout_exercise_id: exRecord.id,
                  user_id: user.id,
                  set_number: s.setNumber,
                  weight_kg: s.weightKg,
                  reps: s.reps,
                }));
                await supabase.from('workout_sets').insert(setsToInsert);
              }
            }

            // Cardio
            if (workout.cardio && workout.cardio.length > 0) {
              const cardioToInsert = workout.cardio.map(c => ({
                workout_id: wId,
                user_id: user.id,
                activity: c.activity,
                completed: c.completed,
                duration_minutes: c.durationMinutes,
              }));
              await supabase.from('workout_cardio').insert(cardioToInsert);
            }
          }
        } catch (cloudErr) {
          console.error('Failed to sync workout to Supabase:', cloudErr);
        }
      }
    }

    return newWorkout;
  },

  async updateWorkout(workout: CompletedWorkout): Promise<void> {
    const current = await this.getLocalWorkouts();
    const updated = current.map(w => w.id === workout.id ? workout : w);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      // In Supabase, if it's a UUID we update or re-sync
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !workout.id.startsWith('seed-') && !workout.id.startsWith('wkt_')) {
        try {
          await supabase.from('workouts').update({
            workout_type: workout.workoutType,
            workout_date: workout.date,
          }).eq('id', workout.id);
        } catch (e) {
          console.error('Error updating supabase workout', e);
        }
      }
    }
  },

  async deleteWorkout(id: string): Promise<void> {
    const current = await this.getLocalWorkouts();
    const filtered = current.filter(w => w.id !== id);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !id.startsWith('seed-') && !id.startsWith('wkt_')) {
        try {
          await supabase.from('workouts').delete().eq('id', id);
        } catch (e) {
          console.error('Error deleting supabase workout', e);
        }
      }
    }
  },

  getLocalWorkouts(): CompletedWorkout[] {
    try {
      const stored = localStorage.getItem(WORKOUTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // ==================== BODY WEIGHT ====================
  async getBodyWeights(): Promise<BodyWeightLog[]> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data, error } = await supabase
            .from('body_weights')
            .select('id, weight_kg, logged_date, created_at')
            .order('logged_date', { ascending: true });

          if (!error && data) {
            return data.map((d: any) => ({
              id: d.id,
              userId: user.id,
              weightKg: Number(d.weight_kg),
              date: d.logged_date,
              createdAt: d.created_at,
            }));
          }
        } catch (e) {
          console.warn('Supabase fetch failed for weight logs', e);
        }
      }
    }

    try {
      const stored = localStorage.getItem(WEIGHTS_KEY);
      const items: BodyWeightLog[] = stored ? JSON.parse(stored) : [];
      return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch {
      return [];
    }
  },

  async saveBodyWeight(weightKg: number, dateStr?: string): Promise<BodyWeightLog> {
    const todayStr = dateStr || new Date().toISOString().split('T')[0];
    const log: BodyWeightLog = {
      id: 'bw_' + Date.now(),
      weightKg: Math.round(weightKg * 10) / 10,
      date: todayStr,
      createdAt: new Date().toISOString(),
    };

    // Update local cache: replace if same date exists, else append
    const current = await this.getBodyWeights();
    const existingIndex = current.findIndex(w => w.date === todayStr);
    let updated: BodyWeightLog[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = log;
    } else {
      updated = [...current, log];
    }
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(updated));

    // Cloud sync
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from('body_weights').upsert({
            user_id: user.id,
            weight_kg: log.weightKg,
            logged_date: todayStr,
          }, {
            onConflict: 'user_id,logged_date'
          });
        } catch (e) {
          console.error('Failed to sync weight to Supabase:', e);
        }
      }
    }

    return log;
  },

  // ==================== EXERCISES ====================
  getExercises(): ExerciseDefinition[] {
    try {
      const customRaw = localStorage.getItem(EXERCISES_KEY);
      if (!customRaw) {
        return DEFAULT_EXERCISES;
      }
      const customList: ExerciseDefinition[] = JSON.parse(customRaw);
      // Filter deleted ones
      return customList.filter(e => !e.isDeleted);
    } catch {
      return DEFAULT_EXERCISES;
    }
  },

  saveCustomExercise(name: string, category: WorkoutCategory, muscleGroup?: string): ExerciseDefinition {
    const all = this.getAllExercisesWithDeleted();
    const newEx: ExerciseDefinition = {
      id: 'custom_' + Date.now(),
      name: name.trim(),
      category,
      muscleGroup: (muscleGroup as any) || (category === 'PUSH' ? 'Chest' : category === 'PULL' ? 'Back' : 'Legs'),
      isCustom: true,
    };
    all.push(newEx);
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(all));
    return newEx;
  },

  updateExercise(id: string, updates: Partial<ExerciseDefinition>): void {
    const all = this.getAllExercisesWithDeleted();
    const updated = all.map(ex => ex.id === id ? { ...ex, ...updates } : ex);
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(updated));
  },

  deleteExercise(id: string): void {
    const all = this.getAllExercisesWithDeleted();
    const updated = all.map(ex => ex.id === id ? { ...ex, isDeleted: true } : ex);
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(updated));
  },

  getAllExercisesWithDeleted(): ExerciseDefinition[] {
    try {
      const stored = localStorage.getItem(EXERCISES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(EXERCISES_KEY, JSON.stringify(DEFAULT_EXERCISES));
      return [...DEFAULT_EXERCISES];
    } catch {
      return [...DEFAULT_EXERCISES];
    }
  },

  resetExercisesToDefault(): void {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(DEFAULT_EXERCISES));
  }
};
