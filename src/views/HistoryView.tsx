import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell, 
  Activity, 
  Edit3, 
  Trash2, 
  Search
} from 'lucide-react';
import { CompletedWorkout } from '../types';
import { StorageService } from '../services/storageService';
import { WORKOUT_DISPLAY_NAMES, WORKOUT_ICONS } from '../constants/defaultExercises';

interface HistoryViewProps {
  onEditWorkout: (workout: CompletedWorkout) => void;
  onStartNewWorkout: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onEditWorkout,
  onStartNewWorkout
}) => {
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const list = await StorageService.getWorkouts();
    setWorkouts(list);
    // If we have workouts and today doesn't have one, select the date of the most recent workout
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = list.some(w => w.date === todayStr);
    if (!hasToday && list.length > 0) {
      setSelectedDateStr(list[0].date);
      // set month to that workout's month
      const [year, month] = list[0].date.split('-');
      setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Are you sure you want to delete this workout log?')) {
      await StorageService.deleteWorkout(id);
      await loadWorkouts();
    }
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sun

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map workouts by date for fast calendar lookup
  const workoutsByDate = workouts.reduce((acc, w) => {
    if (!acc[w.date]) acc[w.date] = [];
    acc[w.date].push(w);
    return acc;
  }, {} as Record<string, CompletedWorkout[]>);

  // Selected date workout(s)
  const selectedWorkouts = workoutsByDate[selectedDateStr] || [];

  const formatSelectedDateHeading = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dt.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#1F2228] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#CCFF00]" />
            <span>WORKOUT HISTORY</span>
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Browse your past workouts by date or search previous logs
          </p>
        </div>

        <button
          onClick={onStartNewWorkout}
          className="btn-accent px-3 py-1.5 rounded-xl text-xs font-bold"
        >
          + Log Workout
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workouts or exercises (e.g. Incline Bench, Pull)..."
          className="w-full bg-[#121417] border border-[#242830] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E95A5] focus:outline-none focus:border-[#CCFF00]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E95A5] hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* If searching, show search results */}
      {searchQuery.trim() && (
        <div className="gym-card p-4 border-[#242830] space-y-3">
          <h2 className="text-xs font-black text-white uppercase tracking-wider">
            Search Results for "{searchQuery}"
          </h2>
          {workouts.filter(w => 
            w.workoutType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.date.includes(searchQuery) ||
            w.exercises.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
          ).length === 0 ? (
            <p className="text-xs text-[#8E95A5]">No matching workouts found.</p>
          ) : (
            workouts.filter(w => 
              w.workoutType.toLowerCase().includes(searchQuery.toLowerCase()) ||
              w.date.includes(searchQuery) ||
              w.exercises.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map(wkt => (
              <div key={wkt.id} className="bg-[#090A0A] p-3 rounded-xl border border-[#1F2228] flex items-center justify-between">
                <div>
                  <span className="font-black text-sm text-white">
                    {WORKOUT_ICONS[wkt.workoutType]} {WORKOUT_DISPLAY_NAMES[wkt.workoutType]}
                  </span>
                  <p className="text-xs text-[#8E95A5]">{wkt.date} • {wkt.exercises.length} Exercises</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDateStr(wkt.date);
                    setSearchQuery('');
                  }}
                  className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  View Date
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar Card */}
      <div className="gym-card p-4 sm:p-6 border-[#242830]">
        
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#181B20] text-[#8E95A5] hover:text-white hover:bg-[#242830] transition-colors border border-[#242830]"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
            {monthName}
          </span>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#181B20] text-[#8E95A5] hover:text-white hover:bg-[#242830] transition-colors border border-[#242830]"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-[#8E95A5] uppercase tracking-wider mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDateStr === dateKey;
            const dayWorkouts = workoutsByDate[dateKey] || [];
            const hasWorkout = dayWorkouts.length > 0;
            const isToday = dateKey === new Date().toISOString().split('T')[0];

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDateStr(dateKey)}
                className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all border ${
                  isSelected
                    ? 'bg-[#CCFF00] text-black font-black border-[#CCFF00] shadow-glow-accent-sm'
                    : hasWorkout
                    ? 'bg-[#181B20] text-white font-bold border-[#2F343E] hover:border-[#CCFF00]/50'
                    : isToday
                    ? 'bg-[#121417] text-white border-[#CCFF00]/40 font-bold'
                    : 'bg-[#0E1013] text-[#8E95A5] border-transparent hover:bg-[#14161B] hover:text-white'
                }`}
              >
                <span className="text-xs sm:text-sm leading-none">{dayNum}</span>
                {hasWorkout && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-black' : 'bg-[#CCFF00]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Workouts Display */}
      <div className="gym-card p-5 sm:p-6 border-[#242830]">
        <div className="border-b border-[#1F2228] pb-3 mb-4">
          <div className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
            Selected Day
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {formatSelectedDateHeading(selectedDateStr)}
          </h2>
        </div>

        {selectedWorkouts.length === 0 ? (
          <div className="text-center py-8 text-[#8E95A5]">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#CCFF00]" />
            <p className="text-xs">No workout logged for this day.</p>
            <button
              onClick={onStartNewWorkout}
              className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold mt-3 text-white hover:text-[#CCFF00]"
            >
              + Log a workout on this date
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedWorkouts.map((wkt) => (
              <div key={wkt.id} className="space-y-4">
                
                {/* Workout Title & Actions */}
                <div className="flex items-center justify-between bg-[#181B20] p-3 rounded-xl border border-[#242830]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {WORKOUT_ICONS[wkt.workoutType]}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">
                        {WORKOUT_DISPLAY_NAMES[wkt.workoutType]}
                      </h3>
                      <span className="text-[10px] text-[#8E95A5]">
                        {wkt.exercises.length} Completed Exercises
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditWorkout(wkt)}
                      className="p-2 rounded-lg bg-[#121417] text-[#8E95A5] hover:text-[#CCFF00] transition-colors border border-[#242830]"
                      title="Edit this workout"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(wkt.id)}
                      className="p-2 rounded-lg bg-[#121417] text-[#8E95A5] hover:text-[#FF453A] transition-colors border border-[#242830]"
                      title="Delete this workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises & Individual Sets as requested */}
                <div className="space-y-3">
                  {wkt.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="bg-[#090A0A] p-3.5 rounded-xl border border-[#1F2228]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-sm text-white uppercase tracking-tight">
                          {ex.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#8E95A5] uppercase">
                          {ex.muscleGroup}
                        </span>
                      </div>

                      {/* Exact sets breakdown: "20 KG × 10", "20 KG × 8" */}
                      <div className="flex flex-wrap gap-2">
                        {ex.sets.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-[#121417] px-2.5 py-1 rounded-lg border border-[#242830] text-xs font-bold text-white flex items-center gap-1.5"
                          >
                            <span className="text-[10px] text-[#8E95A5]">
                              Set {s.setNumber}:
                            </span>
                            <span className="text-[#CCFF00]">{s.weightKg} KG</span>
                            <span className="text-[#8E95A5]">×</span>
                            <span>{s.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Completed Cardio */}
                {wkt.cardio && wkt.cardio.filter((c) => c.completed).length > 0 && (
                  <div className="bg-[#181B20] p-3 rounded-xl border border-[#242830]">
                    <div className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>Cardio Completed</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {wkt.cardio
                        .filter((c) => c.completed)
                        .map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-1 rounded-lg bg-[#090A0A] border border-[#242830] text-xs font-semibold text-white"
                          >
                            {c.activity}: <strong className="text-[#CCFF00]">{c.durationMinutes} mins</strong>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
