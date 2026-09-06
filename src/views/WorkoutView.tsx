import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  Save, 
  Timer, 
  Activity
} from 'lucide-react';
import { 
  WorkoutCategory, 
  MuscleGroup, 
  LoggedExercise, 
  CardioActivity, 
  CompletedWorkout
} from '../types';
import { 
  WORKOUT_DISPLAY_NAMES, 
  WORKOUT_ICONS 
} from '../constants/defaultExercises';
import { StorageService } from '../services/storageService';
import { RestTimer } from '../components/common/RestTimer';

interface WorkoutViewProps {
  initialCategory?: WorkoutCategory;
  onWorkoutSaved: () => void;
  onCancel: () => void;
  editingWorkout?: CompletedWorkout | null;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  initialCategory = 'PUSH',
  onWorkoutSaved,
  onCancel,
  editingWorkout = null,
}) => {
  const [category, setCategory] = useState<WorkoutCategory>(
    editingWorkout ? editingWorkout.workoutType : (initialCategory === 'REST' ? 'PUSH' : initialCategory)
  );
  const [workoutDate, setWorkoutDate] = useState<string>(
    editingWorkout ? editingWorkout.date : new Date().toISOString().split('T')[0]
  );
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  const [cardio, setCardio] = useState<CardioActivity[]>([
    { id: 'running', name: 'Running', completed: false, durationMinutes: 15 },
    { id: 'cycling', name: 'Cycling', completed: false, durationMinutes: 15 },
    { id: 'incline_walk', name: 'Incline Walk', completed: false, durationMinutes: 20 },
  ]);
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [previousWorkouts, setPreviousWorkouts] = useState<CompletedWorkout[]>([]);

  // Load previous workouts to provide reference weights
  useEffect(() => {
    StorageService.getWorkouts().then((history) => {
      setPreviousWorkouts(history);
    });
  }, []);

  // Initialize exercises for this workout category
  useEffect(() => {
    if (editingWorkout) {
      // Load from editing workout
      const mappedExercises: LoggedExercise[] = editingWorkout.exercises.map((ex, idx) => ({
        id: `edit_ex_${idx}`,
        exerciseId: `ex_${idx}`,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        category: editingWorkout.workoutType,
        isSkipped: false,
        sets: ex.sets.map((s, sIdx) => ({
          id: `edit_s_${idx}_${sIdx}`,
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          completed: true,
        }))
      }));
      setExercises(mappedExercises);

      // Cardio
      if (editingWorkout.cardio && editingWorkout.cardio.length > 0) {
        setCardio((prev) =>
          prev.map((c) => {
            const found = editingWorkout.cardio.find((ec) => ec.activity === c.name);
            return found
              ? { ...c, completed: found.completed, durationMinutes: found.durationMinutes }
              : c;
          })
        );
      }
      return;
    }

    // New workout initialization from definitions
    const allDefs = StorageService.getExercises();
    const relevantDefs = allDefs.filter((e) => e.category === category && !e.isDeleted);

    // Grouping order
    const muscleGroupOrder: Record<MuscleGroup, number> = {
      Chest: 1,
      Shoulders: 2,
      Triceps: 3,
      Back: 1,
      Biceps: 2,
      Forearms: 3,
      Legs: 1,
      Abs: 2,
      Other: 4,
    };

    relevantDefs.sort((a, b) => {
      const orderA = muscleGroupOrder[a.muscleGroup] || 9;
      const orderB = muscleGroupOrder[b.muscleGroup] || 9;
      return orderA - orderB;
    });

    const initialized: LoggedExercise[] = relevantDefs.map((def, index) => {
      // Find last logged sets for reference
      let defaultWeight = 20;
      let defaultReps = 10;

      // Check history for this exercise
      const prevSession = previousWorkouts.find((w) =>
        w.exercises.some((e) => e.name.toLowerCase() === def.name.toLowerCase())
      );
      if (prevSession) {
        const foundPrevEx = prevSession.exercises.find(
          (e) => e.name.toLowerCase() === def.name.toLowerCase()
        );
        if (foundPrevEx && foundPrevEx.sets.length > 0) {
          defaultWeight = foundPrevEx.sets[0].weightKg;
          defaultReps = foundPrevEx.sets[0].reps;
        }
      }

      return {
        id: `log_${def.id}_${Date.now()}_${index}`,
        exerciseId: def.id,
        name: def.name,
        muscleGroup: def.muscleGroup,
        category: def.category,
        isSkipped: false,
        // Each exercise has 3 sets already created by default as requested
        sets: [
          { id: `s1_${index}`, setNumber: 1, weightKg: defaultWeight, reps: defaultReps },
          { id: `s2_${index}`, setNumber: 2, weightKg: defaultWeight, reps: defaultReps },
          { id: `s3_${index}`, setNumber: 3, weightKg: defaultWeight, reps: Math.max(6, defaultReps - 2) },
        ],
      };
    });

    setExercises(initialized);
  }, [category, editingWorkout]);

  // Set mutation handlers
  const updateSet = (exerciseId: string, setId: string, field: 'weightKg' | 'reps', value: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            return { ...s, [field]: Math.max(0, value) };
          }),
        };
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const newSet = {
          id: `s_${Date.now()}_${Math.random()}`,
          setNumber: newSetNumber,
          weightKg: lastSet ? lastSet.weightKg : 20,
          reps: lastSet ? lastSet.reps : 10,
        };
        return {
          ...ex,
          isSkipped: false, // unskip if set is added
          sets: [...ex.sets, newSet],
        };
      })
    );
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const remaining = ex.sets.filter((s) => s.id !== setId);
        // Renumber sets
        const renumbered = remaining.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return {
          ...ex,
          sets: renumbered,
        };
      })
    );
  };

  const toggleSkipExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, isSkipped: !ex.isSkipped };
      })
    );
  };

  const updateCardio = (id: string, completed: boolean, durationMinutes?: number) => {
    setCardio((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          completed,
          durationMinutes: durationMinutes !== undefined ? durationMinutes : c.durationMinutes,
        };
      })
    );
  };

  const handleSaveWorkout = async () => {
    // Only non-skipped exercises that have at least 1 set
    const completedExercises = exercises.filter(
      (ex) => !ex.isSkipped && ex.sets.length > 0
    );

    if (completedExercises.length === 0 && !cardio.some((c) => c.completed)) {
      alert('Please log at least one exercise or cardio session before saving.');
      return;
    }

    setIsSaving(true);

    try {
      if (editingWorkout) {
        const updatedWorkout: CompletedWorkout = {
          ...editingWorkout,
          workoutType: category,
          date: workoutDate,
          exercises: completedExercises.map((ex) => ({
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: ex.sets.map((s) => ({
              setNumber: s.setNumber,
              weightKg: s.weightKg,
              reps: s.reps,
            })),
          })),
          cardio: cardio.map((c) => ({
            activity: c.name,
            completed: c.completed,
            durationMinutes: c.durationMinutes,
          })),
        };
        await StorageService.updateWorkout(updatedWorkout);
      } else {
        await StorageService.saveWorkout({
          workoutType: category,
          date: workoutDate,
          exercises: completedExercises.map((ex) => ({
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: ex.sets.map((s) => ({
              setNumber: s.setNumber,
              weightKg: s.weightKg,
              reps: s.reps,
            })),
          })),
          cardio: cardio.map((c) => ({
            activity: c.name,
            completed: c.completed,
            durationMinutes: c.durationMinutes,
          })),
        });

        // Trigger celebratory confetti on new completed workout
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#CCFF00', '#FFFFFF', '#0A84FF'],
          });
        } catch (e) {
          // ignore if canvas blocked
        }
      }

      onWorkoutSaved();
    } catch (err: any) {
      alert('Error saving workout: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Group active exercises by muscle group for organized visual navigation
  const groupedExercises = exercises.reduce((acc, ex) => {
    const group = ex.muscleGroup || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {} as Record<string, LoggedExercise[]>);

  const completedExCount = exercises.filter((e) => !e.isSkipped).length;
  const skippedExCount = exercises.filter((e) => e.isSkipped).length;

  return (
    <div className="space-y-6 pb-32 max-w-3xl mx-auto">
      
      {/* Top Header Card */}
      <div className="gym-card p-5 border-[#2F343E] bg-[#121417]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                {WORKOUT_ICONS[category]} {WORKOUT_DISPLAY_NAMES[category]}
              </span>
              {editingWorkout && (
                <span className="bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  Editing
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E95A5]">
              {completedExCount} active exercises • {skippedExCount} skipped
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Rest Timer Button */}
            <button
              onClick={() => setShowRestTimer(!showRestTimer)}
              className="btn-secondary px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 text-white hover:text-[#CCFF00]"
              title="Open Rest Stopwatch"
            >
              <Timer className="w-4 h-4 text-[#CCFF00]" />
              <span>Rest Timer</span>
            </button>

            {/* Switch Workout Type (Push, Pull, Legs) */}
            {!editingWorkout && (
              <div className="flex bg-[#090A0A] p-1 rounded-xl border border-[#242830]">
                {(['PUSH', 'PULL', 'LEGS'] as WorkoutCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      category === cat
                        ? 'bg-[#CCFF00] text-black shadow-sm'
                        : 'text-[#8E95A5] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Selector */}
        <div className="mt-4 pt-3 border-t border-[#1F2228] flex items-center justify-between text-xs">
          <span className="text-[#8E95A5] font-semibold">Workout Date:</span>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            className="bg-[#090A0A] text-white border border-[#242830] rounded-lg px-2.5 py-1 text-xs focus:border-[#CCFF00] focus:outline-none"
          />
        </div>
      </div>

      {/* Optional Rest Timer floating card */}
      {showRestTimer && <RestTimer onClose={() => setShowRestTimer(false)} />}

      {/* Exercises list grouped by muscle group */}
      <div className="space-y-6">
        {Object.entries(groupedExercises).map(([group, exList]) => (
          <div key={group} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-black tracking-widest uppercase text-[#CCFF00]">
                {group}
              </span>
              <div className="flex-1 h-px bg-[#1F2228]" />
            </div>

            {exList.map((exercise) => {
              const isSkipped = exercise.isSkipped;

              return (
                <div
                  key={exercise.id}
                  className={`gym-card transition-all duration-200 ${
                    isSkipped
                      ? 'opacity-45 bg-[#0D0F12] border-dashed border-[#1F2228]'
                      : 'border-[#242830] hover:border-[#323742]'
                  }`}
                >
                  {/* Exercise Title & Skip Button */}
                  <div className="p-4 flex items-center justify-between border-b border-[#1F2228]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${isSkipped ? 'bg-[#8E95A5]' : 'bg-[#CCFF00]'}`} />
                      <div>
                        <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${isSkipped ? 'text-[#8E95A5] line-through' : 'text-white'}`}>
                          {exercise.name}
                        </h3>
                        <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider">
                          {exercise.muscleGroup}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSkipExercise(exercise.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isSkipped
                          ? 'bg-[#1F2228] text-[#CCFF00] hover:bg-[#282C34]'
                          : 'bg-[#181B20] text-[#8E95A5] hover:text-[#FF453A] hover:bg-[#242830]'
                      }`}
                    >
                      {isSkipped ? 'Unskip Exercise' : 'Skip Exercise'}
                    </button>
                  </div>

                  {/* Individual Sets (Shown only if not skipped) */}
                  {!isSkipped && (
                    <div className="p-4 space-y-3">
                      {/* Set Headers */}
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-[#8E95A5] px-1 tracking-wider">
                        <div className="col-span-2">SET</div>
                        <div className="col-span-5 text-center">WEIGHT (KG)</div>
                        <div className="col-span-4 text-center">REPS</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Sets list */}
                      {exercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className="grid grid-cols-12 gap-2 items-center bg-[#090A0A] p-2 rounded-xl border border-[#1F2228] focus-within:border-[#CCFF00]/50"
                        >
                          {/* Set Number */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="w-7 h-7 rounded-lg bg-[#181B20] text-[#CCFF00] font-black text-xs flex items-center justify-center border border-[#242830]">
                              {set.setNumber}
                            </span>
                          </div>

                          {/* Weight with Quick Controls */}
                          <div className="col-span-5 flex items-center justify-center gap-1 bg-[#121417] rounded-lg px-1.5 py-1 border border-[#242830]">
                            <button
                              type="button"
                              onClick={() => updateSet(exercise.id, set.id, 'weightKg', set.weightKg - 2.5)}
                              className="w-6 h-6 rounded bg-[#181B20] text-white hover:bg-[#282C34] flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="500"
                              value={set.weightKg === 0 ? '' : set.weightKg}
                              onChange={(e) => updateSet(exercise.id, set.id, 'weightKg', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-14 bg-transparent text-white font-black text-center text-sm focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateSet(exercise.id, set.id, 'weightKg', set.weightKg + 2.5)}
                              className="w-6 h-6 rounded bg-[#181B20] text-white hover:bg-[#282C34] flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps with Quick Controls */}
                          <div className="col-span-4 flex items-center justify-center gap-1 bg-[#121417] rounded-lg px-1.5 py-1 border border-[#242830]">
                            <button
                              type="button"
                              onClick={() => updateSet(exercise.id, set.id, 'reps', set.reps - 1)}
                              className="w-6 h-6 rounded bg-[#181B20] text-white hover:bg-[#282C34] flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-10 bg-transparent text-white font-black text-center text-sm focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateSet(exercise.id, set.id, 'reps', set.reps + 1)}
                              className="w-6 h-6 rounded bg-[#181B20] text-white hover:bg-[#282C34] flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Set */}
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => deleteSet(exercise.id, set.id)}
                              className="p-1.5 rounded-lg text-[#8E95A5] hover:text-[#FF453A] hover:bg-[#181B20] transition-colors"
                              title="Delete set"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Set Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => addSet(exercise.id)}
                          className="w-full py-2.5 rounded-xl bg-[#181B20] hover:bg-[#1F2228] border border-[#242830] text-[#CCFF00] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>+ ADD SET</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* CARDIO SECTION (At the bottom of every workout as requested) */}
      <div className="gym-card p-5 sm:p-6 border-[#2F343E] bg-[#121417]">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-[#CCFF00]" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
            CARDIO SECTION
          </h2>
        </div>
        <p className="text-xs text-[#8E95A5] mb-5">
          Select any activities completed today and enter duration in minutes.
        </p>

        <div className="space-y-3">
          {cardio.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-xl border transition-all ${
                activity.completed
                  ? 'bg-[#181B20] border-[#CCFF00]/50'
                  : 'bg-[#090A0A] border-[#242830]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="font-extrabold text-sm text-white">
                    {activity.name}
                  </span>

                  {/* YES / NO Toggle as requested */}
                  <div className="flex items-center gap-1 bg-[#121417] p-1 rounded-xl border border-[#242830]">
                    <button
                      type="button"
                      onClick={() => updateCardio(activity.id, true)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                        activity.completed
                          ? 'bg-[#CCFF00] text-black shadow-sm'
                          : 'text-[#8E95A5] hover:text-white'
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCardio(activity.id, false)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                        !activity.completed
                          ? 'bg-[#1F2228] text-white'
                          : 'text-[#8E95A5] hover:text-white'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {/* Duration Input */}
                {activity.completed && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-[#8E95A5] font-semibold">Time:</span>
                    <div className="flex items-center bg-[#090A0A] px-2.5 py-1 rounded-lg border border-[#2F343E]">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={activity.durationMinutes}
                        onChange={(e) => updateCardio(activity.id, true, parseInt(e.target.value) || 0)}
                        className="w-12 bg-transparent text-white font-black text-center text-sm focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#8E95A5]">MINUTES</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Workout Footer */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-[#090A0A]/95 backdrop-blur-md border-t border-[#1F2228] p-3 sm:p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-5 py-3.5 rounded-xl text-xs font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveWorkout}
            disabled={isSaving}
            className="btn-accent flex-1 py-3.5 sm:py-4 px-6 rounded-xl text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-accent"
          >
            <Save className="w-5 h-5 stroke-[2.5]" />
            <span>{isSaving ? 'SAVING...' : (editingWorkout ? 'UPDATE WORKOUT' : 'SAVE WORKOUT')}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
