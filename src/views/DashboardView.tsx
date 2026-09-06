import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Calendar as CalendarIcon, 
  Scale, 
  ChevronRight, 
  Check, 
  Plus, 
  Minus, 
  Moon,
  Coffee,
  HeartPulse,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { WorkoutCategory, BodyWeightLog, CompletedWorkout } from '../types';
import { 
  DAY_WORKOUT_MAP, 
  WORKOUT_DISPLAY_NAMES, 
  WORKOUT_ICONS 
} from '../constants/defaultExercises';
import { StorageService } from '../services/storageService';

interface DashboardViewProps {
  onStartWorkout: (category: WorkoutCategory) => void;
  onNavigateToHistory: () => void;
  onNavigateToProgress: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartWorkout,
  onNavigateToHistory,
  onNavigateToProgress
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutCategory>('PUSH');
  const [weightInput, setWeightInput] = useState<string>('72.5');
  const [weights, setWeights] = useState<BodyWeightLog[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<CompletedWorkout[]>([]);
  const [isWeightSaved, setIsWeightSaved] = useState<boolean>(false);
  const [isOverridden, setIsOverridden] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);

    // Get natural scheduled workout for today
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday ...
    const scheduled = DAY_WORKOUT_MAP[dayOfWeek] || 'PUSH';
    setSelectedWorkout(scheduled);

    // Load data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const wLogs = await StorageService.getBodyWeights();
    setWeights(wLogs);

    // Check if weight already logged for today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = wLogs.find(w => w.date === todayStr);
    if (todayLog) {
      setWeightInput(todayLog.weightKg.toString());
      setIsWeightSaved(true);
    } else if (wLogs.length > 0) {
      // Pre-fill with the latest logged weight
      const latest = wLogs[wLogs.length - 1];
      setWeightInput(latest.weightKg.toString());
    }

    const completed = await StorageService.getWorkouts();
    setRecentWorkouts(completed);
  };

  const handleSaveWeight = async () => {
    const num = parseFloat(weightInput);
    if (isNaN(num) || num <= 20 || num >= 300) {
      alert('Please enter a realistic weight in KG (e.g. 72.5)');
      return;
    }

    await StorageService.saveBodyWeight(num);
    setIsWeightSaved(true);
    const updated = await StorageService.getBodyWeights();
    setWeights(updated);

    setTimeout(() => {
      setIsWeightSaved(false);
    }, 2500);
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weightInput) || 70.0;
    const updated = Math.round((current + delta) * 10) / 10;
    if (updated > 20 && updated < 300) {
      setWeightInput(updated.toFixed(1));
    }
  };

  // Formatted date string (e.g. "MONDAY, 7 SEPTEMBER 2026")
  const dateFormatted = currentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  const isRestDay = selectedWorkout === 'REST';

  // Weight stats
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : null;
  const prevWeight = weights.length > 1 ? weights[weights.length - 2].weightKg : null;
  const weightChange = latestWeight && prevWeight ? Math.round((latestWeight - prevWeight) * 10) / 10 : 0;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      
      {/* Date & Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2228] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8E95A5] tracking-widest uppercase mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {dateFormatted}
          </h1>
        </div>

        {/* Quick Workout Override Switcher */}
        <div className="flex items-center gap-1 bg-[#121417] p-1 rounded-xl border border-[#242830] self-start sm:self-auto">
          {(['PUSH', 'PULL', 'LEGS', 'REST'] as WorkoutCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedWorkout(cat);
                setIsOverridden(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide transition-colors ${
                selectedWorkout === cat
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Today's Workout Card */}
      {isRestDay ? (
        // Rest Day Screen (Encouraging and simple)
        <div className="gym-card p-6 sm:p-8 border-[#2F343E] relative overflow-hidden bg-gradient-to-br from-[#121417] via-[#15191E] to-[#0D1117]">
          <div className="relative z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181B20] text-[#8E95A5] text-xs font-bold tracking-wider uppercase border border-[#242830] mb-3">
              <Moon className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>Recovery & Growth</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              REST DAY
            </h2>

            <p className="text-sm sm:text-base text-[#8E95A5] max-w-xl leading-relaxed mb-6">
              Muscles grow during recovery, not in the gym. Take time today to rehydrate, eat high-quality protein, get 8 hours of sleep, and let your central nervous system recharge.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#181B20] p-3.5 rounded-xl border border-[#242830] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A84FF]/10 text-[#0A84FF]">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8E95A5]">Hydration & Fuel</div>
                  <div className="text-sm font-bold text-white">3-4 Litres Water</div>
                </div>
              </div>

              <div className="bg-[#181B20] p-3.5 rounded-xl border border-[#242830] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#30D158]/10 text-[#30D158]">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8E95A5]">Active Mobility</div>
                  <div className="text-sm font-bold text-white">Light Walk or Stretch</div>
                </div>
              </div>

              <div className="bg-[#181B20] p-3.5 rounded-xl border border-[#242830] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#CCFF00]/10 text-[#CCFF00]">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#8E95A5]">Sleep Goal</div>
                  <div className="text-sm font-bold text-white">8+ Hours Sleep</div>
                </div>
              </div>
            </div>

            {/* Optional Workout Override if they really want to train */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <span className="text-xs text-[#8E95A5]">Want to train anyway?</span>
              <button
                onClick={() => {
                  setSelectedWorkout('PUSH');
                  setIsOverridden(true);
                  onStartWorkout('PUSH');
                }}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold text-white hover:text-[#CCFF00]"
              >
                Switch to Push Workout →
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Active Training Day Card
        <div className="gym-card p-6 sm:p-8 border-[#2F343E] relative overflow-hidden bg-gradient-to-br from-[#121417] via-[#14181E] to-[#121417] glow-border">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-black tracking-widest text-[#CCFF00] uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-[#CCFF00]" />
                TODAY'S WORKOUT
              </span>
              {isOverridden && (
                <span className="text-[10px] font-bold text-[#8E95A5] bg-[#181B20] px-2 py-0.5 rounded border border-[#242830]">
                  Manual Override
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {WORKOUT_ICONS[selectedWorkout]} {WORKOUT_DISPLAY_NAMES[selectedWorkout]}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#8E95A5] mb-6">
              {selectedWorkout === 'PUSH' && 'Targeting Chest, Shoulders & Triceps with pre-loaded progressive overload sets.'}
              {selectedWorkout === 'PULL' && 'Targeting Back, Biceps & Forearms with pre-loaded progressive overload sets.'}
              {selectedWorkout === 'LEGS' && 'Targeting Quads, Hamstrings, Calves & Abs with pre-loaded progressive overload sets.'}
            </p>

            <button
              onClick={() => onStartWorkout(selectedWorkout)}
              className="btn-accent w-full py-4 sm:py-5 px-6 rounded-2xl text-base sm:text-lg font-black uppercase tracking-wider flex items-center justify-center gap-3 shadow-glow-accent group"
            >
              <span>START {selectedWorkout} WORKOUT</span>
              <ChevronRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Body Weight Tracker Card */}
      <div className="gym-card p-5 sm:p-6 border-[#242830]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00]">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Today's Weight
              </h3>
              <p className="text-[11px] text-[#8E95A5]">
                Log your body weight daily to track trend
              </p>
            </div>
          </div>

          {latestWeight && (
            <div className="text-right">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                {weightChange !== 0 && (
                  weightChange > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#FF9F0A]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[#30D158]" />
                  )
                )}
                <span>{latestWeight} KG</span>
              </div>
              <div className="text-[10px] text-[#8E95A5]">
                {weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange} kg vs prev` : 'Current'}
              </div>
            </div>
          )}
        </div>

        {/* Input & Big Buttons for Gym Mobile Use */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center bg-[#090A0A] border border-[#242830] rounded-2xl px-3 py-2 flex-1 focus-within:border-[#CCFF00]">
            <button
              type="button"
              onClick={() => adjustWeight(-0.5)}
              className="w-10 h-10 rounded-xl bg-[#181B20] text-white hover:bg-[#242830] flex items-center justify-center font-bold active:scale-95 transition-all text-base"
              title="-0.5 kg"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-1.5 px-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="250"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="bg-transparent text-white text-3xl sm:text-4xl font-black text-center w-28 focus:outline-none tracking-tight"
                placeholder="72.5"
              />
              <span className="text-base font-extrabold text-[#8E95A5]">KG</span>
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(0.5)}
              className="w-10 h-10 rounded-xl bg-[#181B20] text-white hover:bg-[#242830] flex items-center justify-center font-bold active:scale-95 transition-all text-base"
              title="+0.5 kg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveWeight}
            className={`py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 ${
              isWeightSaved
                ? 'bg-[#30D158] text-black shadow-sm'
                : 'btn-accent'
            }`}
          >
            {isWeightSaved ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>SAVED!</span>
              </>
            ) : (
              <span>SAVE WEIGHT</span>
            )}
          </button>
        </div>

        {/* Mini Weight Sparkline / Trend */}
        {weights.length > 1 && (
          <div className="mt-4 pt-3 border-t border-[#1F2228] flex items-center justify-between">
            <div className="text-[11px] text-[#8E95A5]">
              Recent 7-Day Trend
            </div>
            <button
              onClick={onNavigateToProgress}
              className="text-[11px] font-bold text-[#CCFF00] hover:underline flex items-center gap-1"
            >
              <span>View Full Progress Graph</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Recent Activity / Streak */}
      {recentWorkouts.length > 0 && (
        <div className="gym-card p-5 border-[#242830]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#8E95A5] uppercase tracking-widest">
              Last Completed Workout
            </h3>
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-bold text-[#CCFF00] hover:underline flex items-center gap-1"
            >
              <span>History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#181B20] p-4 rounded-xl border border-[#242830] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">
                  {WORKOUT_ICONS[recentWorkouts[0].workoutType]} {WORKOUT_DISPLAY_NAMES[recentWorkouts[0].workoutType]}
                </span>
                <span className="text-xs text-[#8E95A5]">
                  • {recentWorkouts[0].date}
                </span>
              </div>
              <p className="text-xs text-[#8E95A5] mt-1">
                {recentWorkouts[0].exercises.length} Exercises Completed
                {recentWorkouts[0].cardio.some(c => c.completed) && ' • Cardio Completed'}
              </p>
            </div>

            <button
              onClick={onNavigateToHistory}
              className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-bold self-start sm:self-center"
            >
              View Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
