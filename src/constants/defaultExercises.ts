import { ExerciseDefinition, WorkoutCategory } from '../types';


export const DEFAULT_EXERCISES: ExerciseDefinition[] = [
  // ==================== PUSH DAY ====================
  // CHEST
  { id: 'push-chest-1', name: 'Incline Bench Press', category: 'PUSH', muscleGroup: 'Chest' },
  { id: 'push-chest-2', name: 'Decline Bench Press', category: 'PUSH', muscleGroup: 'Chest' },
  { id: 'push-chest-3', name: 'Flat Bench Press', category: 'PUSH', muscleGroup: 'Chest' },
  { id: 'push-chest-4', name: 'Flat Dumbbell Press', category: 'PUSH', muscleGroup: 'Chest' },
  { id: 'push-chest-5', name: 'Cable Chest Fly', category: 'PUSH', muscleGroup: 'Chest' },
  { id: 'push-chest-6', name: 'Pec Deck Fly', category: 'PUSH', muscleGroup: 'Chest' },
  { id: 'push-chest-7', name: 'Dips', category: 'PUSH', muscleGroup: 'Chest' },
  // SHOULDERS
  { id: 'push-sh-1', name: 'Lateral Raises', category: 'PUSH', muscleGroup: 'Shoulders' },
  { id: 'push-sh-2', name: 'Upright Row', category: 'PUSH', muscleGroup: 'Shoulders' },
  // TRICEPS
  { id: 'push-tri-1', name: 'Cable Triceps Pushdown', category: 'PUSH', muscleGroup: 'Triceps' },

  // ==================== PULL DAY ====================
  // BACK
  { id: 'pull-back-1', name: 'Lat Pulldown', category: 'PULL', muscleGroup: 'Back' },
  { id: 'pull-back-2', name: 'Seated Cable Row', category: 'PULL', muscleGroup: 'Back' },
  { id: 'pull-back-3', name: 'Plate-Loaded Chest-Supported T-Bar Row', category: 'PULL', muscleGroup: 'Back' },
  { id: 'pull-back-4', name: 'Pull-Ups', category: 'PULL', muscleGroup: 'Back' },
  { id: 'pull-back-5', name: 'Rear Pec Deck Fly', category: 'PULL', muscleGroup: 'Back' },
  { id: 'pull-back-6', name: 'Face Pulls', category: 'PULL', muscleGroup: 'Back' },
  // BICEPS
  { id: 'pull-bi-1', name: 'Bicep Curls', category: 'PULL', muscleGroup: 'Biceps' },
  { id: 'pull-bi-2', name: 'Hammer Curls', category: 'PULL', muscleGroup: 'Biceps' },
  { id: 'pull-bi-3', name: 'Preacher Curls', category: 'PULL', muscleGroup: 'Biceps' },
  // FOREARMS
  { id: 'pull-fa-1', name: 'Wrist Curls', category: 'PULL', muscleGroup: 'Forearms' },
  { id: 'pull-fa-2', name: 'Reverse Grip Forearm Curls', category: 'PULL', muscleGroup: 'Forearms' },

  // ==================== LEGS DAY ====================
  // LEGS
  { id: 'legs-leg-1', name: 'Squats', category: 'LEGS', muscleGroup: 'Legs' },
  { id: 'legs-leg-2', name: 'Lunges', category: 'LEGS', muscleGroup: 'Legs' },
  { id: 'legs-leg-3', name: 'Leg Press', category: 'LEGS', muscleGroup: 'Legs' },
  { id: 'legs-leg-4', name: 'Leg Curls', category: 'LEGS', muscleGroup: 'Legs' },
  { id: 'legs-leg-5', name: 'Calf Raises', category: 'LEGS', muscleGroup: 'Legs' },
  // ABS
  { id: 'legs-abs-1', name: 'Crunches', category: 'LEGS', muscleGroup: 'Abs' },
  { id: 'legs-abs-2', name: 'Hanging Leg Raises', category: 'LEGS', muscleGroup: 'Abs' },
];

export const CARDIO_DEFAULTS = [
  { id: 'running', name: 'Running', completed: false, durationMinutes: 15 },
  { id: 'cycling', name: 'Cycling', completed: false, durationMinutes: 15 },
  { id: 'incline_walk', name: 'Incline Walk', completed: false, durationMinutes: 20 },
] as const;

export const DAY_WORKOUT_MAP: Record<number, WorkoutCategory> = {
  0: 'REST', // Sunday
  1: 'PUSH', // Monday
  2: 'PULL', // Tuesday
  3: 'LEGS', // Wednesday
  4: 'PUSH', // Thursday
  5: 'PULL', // Friday
  6: 'LEGS', // Saturday
};

export const WORKOUT_DISPLAY_NAMES: Record<WorkoutCategory, string> = {
  PUSH: 'PUSH DAY',
  PULL: 'PULL DAY',
  LEGS: 'LEGS DAY',
  REST: 'REST DAY',
};

export const WORKOUT_ICONS: Record<WorkoutCategory, string> = {
  PUSH: '🔥',
  PULL: '⚡',
  LEGS: '💥',
  REST: '🔋',
};
