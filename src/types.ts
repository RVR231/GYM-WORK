export type WorkoutCategory = 'PUSH' | 'PULL' | 'LEGS' | 'REST';

export type MuscleGroup = 
  | 'Chest' 
  | 'Shoulders' 
  | 'Triceps' 
  | 'Back' 
  | 'Biceps' 
  | 'Forearms' 
  | 'Legs' 
  | 'Abs' 
  | 'Other';

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: WorkoutCategory;
  muscleGroup: MuscleGroup;
  isCustom?: boolean;
  isDeleted?: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed?: boolean;
}

export interface LoggedExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  category: WorkoutCategory;
  isSkipped: boolean;
  sets: WorkoutSet[];
}

export interface CardioActivity {
  id: 'running' | 'cycling' | 'incline_walk';
  name: 'Running' | 'Cycling' | 'Incline Walk';
  completed: boolean;
  durationMinutes: number;
}

export interface CompletedWorkout {
  id: string;
  userId?: string;
  workoutType: WorkoutCategory;
  date: string; // YYYY-MM-DD
  durationMinutes?: number;
  notes?: string;
  exercises: {
    name: string;
    muscleGroup: MuscleGroup;
    sets: {
      setNumber: number;
      weightKg: number;
      reps: number;
    }[];
  }[];
  cardio: {
    activity: string;
    completed: boolean;
    durationMinutes: number;
  }[];
  createdAt: string;
}

export interface BodyWeightLog {
  id: string;
  userId?: string;
  weightKg: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export type TabType = 'home' | 'workout' | 'history' | 'progress' | 'exercises';
