import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Scale, 
  Dumbbell, 
  ChevronDown, 
  Flame, 
  Award,
  Calendar
} from 'lucide-react';
import { CompletedWorkout, BodyWeightLog } from '../types';
import { StorageService } from '../services/storageService';

export const ProgressView: React.FC = () => {
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [weights, setWeights] = useState<BodyWeightLog[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('Incline Bench Press');
  const [activeTab, setActiveTab] = useState<'exercise' | 'weight'>('exercise');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const wList = await StorageService.getWorkouts();
    setWorkouts(wList);

    const bList = await StorageService.getBodyWeights();
    setWeights(bList);

    // Pick first exercise that has data if available
    if (wList.length > 0) {
      const allExNames = new Set<string>();
      wList.forEach(w => w.exercises.forEach(e => allExNames.add(e.name)));
      if (allExNames.size > 0 && !allExNames.has('Incline Bench Press')) {
        setSelectedExercise(Array.from(allExNames)[0]);
      }
    }
  };

  // Get list of unique exercises across all workouts or all registered exercises
  const availableExercises = Array.from(
    new Set([
      ...workouts.flatMap((w) => w.exercises.map((e) => e.name)),
      ...StorageService.getExercises().map((e) => e.name),
    ])
  ).sort();

  // Extract progression points for selected exercise
  // Sorted chronologically
  const exerciseProgressData = workouts
    .filter((w) =>
      w.exercises.some((e) => e.name.toLowerCase() === selectedExercise.toLowerCase())
    )
    .map((w) => {
      const ex = w.exercises.find(
        (e) => e.name.toLowerCase() === selectedExercise.toLowerCase()
      )!;
      // Max weight lifted in that session
      const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg), 0);
      // Best set (weight & reps)
      const bestSet = ex.sets.reduce((prev, curr) =>
        curr.weightKg > prev.weightKg ? curr : prev, ex.sets[0]
      );
      return {
        date: w.date,
        maxWeight,
        bestSet,
        totalSets: ex.sets.length,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Personal Record
  const prWeight = exerciseProgressData.length > 0
    ? Math.max(...exerciseProgressData.map((d) => d.maxWeight))
    : 0;

  // Body weight stats
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const minWeight = sortedWeights.length > 0 ? Math.min(...sortedWeights.map(w => w.weightKg)) : 0;
  const maxWeight = sortedWeights.length > 0 ? Math.max(...sortedWeights.map(w => w.weightKg)) : 0;
  const latestWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weightKg : 0;
  const startWeight = sortedWeights.length > 0 ? sortedWeights[0].weightKg : 0;
  const netWeightChange = Math.round((latestWeight - startWeight) * 10) / 10;

  // Helper to render clean SVG line chart
  const renderLineChart = (
    data: { label: string; value: number }[],
    unit: string,
    strokeColor = '#CCFF00'
  ) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-[#8E95A5] text-xs">
          No data points recorded yet.
        </div>
      );
    }

    if (data.length === 1) {
      return (
        <div className="text-center py-10 bg-[#090A0A] rounded-xl border border-[#1F2228]">
          <div className="text-3xl font-black text-white">
            {data[0].value} <span className="text-sm font-bold text-[#8E95A5]">{unit}</span>
          </div>
          <p className="text-xs text-[#8E95A5] mt-1">Logged on {data[0].label}</p>
          <p className="text-[11px] text-[#8E95A5] mt-2">Log more sessions to view trend line.</p>
        </div>
      );
    }

    const values = data.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const width = 560;
    const height = 180;
    const paddingX = 40;
    const paddingY = 30;

    const points = data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
      const normalizedY = (d.value - minVal) / range;
      const y = height - paddingY - normalizedY * (height - paddingY * 2);
      return { x, y, ...d };
    });

    const pathString = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area fill path
    const areaString = `${pathString} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1F2228"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#1F2228"
          />

          {/* Area Fill */}
          <path d={areaString} fill="url(#chartGradient)" />

          {/* Smooth Line */}
          <path
            d={pathString}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points with Value Tooltip */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#090A0A"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#F3F4F6"
              >
                {p.value}
              </text>
              <text
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#8E95A5"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2228] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#CCFF00]" />
            <span>PROGRESS</span>
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Track your strength progression and body weight over time
          </p>
        </div>

        {/* Tab Toggle (Exercise Progress vs Body Weight) */}
        <div className="flex bg-[#121417] p-1 rounded-xl border border-[#242830]">
          <button
            onClick={() => setActiveTab('exercise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'exercise'
                ? 'bg-[#CCFF00] text-black shadow-sm'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Exercise Strength</span>
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'weight'
                ? 'bg-[#CCFF00] text-black shadow-sm'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Body Weight</span>
          </button>
        </div>
      </div>

      {activeTab === 'exercise' ? (
        // ==================== EXERCISE PROGRESS ====================
        <div className="space-y-6">
          
          {/* Exercise Selector */}
          <div className="gym-card p-4 sm:p-5 border-[#242830]">
            <label className="text-xs font-black uppercase tracking-wider text-[#8E95A5] mb-2 block">
              Select Exercise to Analyze
            </label>
            <div className="relative">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full appearance-none bg-[#090A0A] border border-[#2F343E] rounded-xl px-4 py-3 text-sm font-extrabold text-white focus:outline-none focus:border-[#CCFF00] pr-10 cursor-pointer"
              >
                {availableExercises.map((name) => (
                  <option key={name} value={name} className="bg-[#121417] text-white">
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#8E95A5] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="gym-card p-4 border-[#242830]">
              <div className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Personal Best</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {prWeight} <span className="text-xs font-bold text-[#8E95A5]">KG</span>
              </div>
            </div>

            <div className="gym-card p-4 border-[#242830]">
              <div className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>Sessions Logged</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {exerciseProgressData.length}
              </div>
            </div>

            <div className="gym-card p-4 border-[#242830] col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Latest Weight</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {exerciseProgressData.length > 0
                  ? exerciseProgressData[exerciseProgressData.length - 1].maxWeight
                  : 0}{' '}
                <span className="text-xs font-bold text-[#8E95A5]">KG</span>
              </div>
            </div>
          </div>

          {/* Progress Graph */}
          <div className="gym-card p-5 border-[#242830]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  {selectedExercise} Weight Progression
                </h3>
                <p className="text-[11px] text-[#8E95A5]">
                  Max weight lifted per session over time
                </p>
              </div>
            </div>

            {renderLineChart(
              exerciseProgressData.map((d) => {
                const parts = d.date.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const formatted = `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]}`;
                return {
                  label: formatted,
                  value: d.maxWeight,
                };
              }),
              'KG',
              '#CCFF00'
            )}
          </div>

          {/* Example Format List from prompt: "7 SEPT — 20 KG", "14 SEPT — 20 KG", etc. */}
          <div className="gym-card p-5 border-[#242830]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8E95A5] mb-3">
              Progression History
            </h3>

            {exerciseProgressData.length === 0 ? (
              <p className="text-xs text-[#8E95A5]">No workout history logged for this exercise yet.</p>
            ) : (
              <div className="space-y-2">
                {[...exerciseProgressData].reverse().map((d, i) => {
                  const parts = d.date.split('-');
                  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];
                  const dateStr = `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`;

                  return (
                    <div
                      key={i}
                      className="bg-[#090A0A] p-3 rounded-xl border border-[#1F2228] flex items-center justify-between text-xs"
                    >
                      <span className="font-extrabold text-white tracking-wider">
                        {dateStr}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8E95A5]">
                          Best: {d.bestSet.weightKg} KG × {d.bestSet.reps} reps
                        </span>
                        <span className="font-black text-[#CCFF00] text-sm">
                          {d.maxWeight} KG
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        // ==================== BODY WEIGHT PROGRESS ====================
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="gym-card p-4 border-[#242830]">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider block mb-1">
                Current
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {latestWeight} <span className="text-xs text-[#8E95A5]">KG</span>
              </div>
            </div>

            <div className="gym-card p-4 border-[#242830]">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider block mb-1">
                Starting
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {startWeight} <span className="text-xs text-[#8E95A5]">KG</span>
              </div>
            </div>

            <div className="gym-card p-4 border-[#242830]">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider block mb-1">
                Lowest
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {minWeight} <span className="text-xs text-[#8E95A5]">KG</span>
              </div>
            </div>

            <div className="gym-card p-4 border-[#242830]">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider block mb-1">
                Highest
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {maxWeight} <span className="text-xs text-[#8E95A5]">KG</span>
              </div>
            </div>

            <div className="gym-card p-4 border-[#242830] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider block mb-1">
                Net Change
              </span>
              <div className={`text-xl sm:text-2xl font-black ${netWeightChange < 0 ? 'text-[#30D158]' : netWeightChange > 0 ? 'text-[#FF9F0A]' : 'text-white'}`}>
                {netWeightChange > 0 ? `+${netWeightChange}` : netWeightChange}{' '}
                <span className="text-xs text-[#8E95A5]">KG</span>
              </div>
            </div>
          </div>

          {/* Body Weight Chart */}
          <div className="gym-card p-5 border-[#242830]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Body Weight Fluctuation
                </h3>
                <p className="text-[11px] text-[#8E95A5]">
                  Daily body weight tracking curve
                </p>
              </div>
            </div>

            {renderLineChart(
              sortedWeights.map((w) => {
                const parts = w.date.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const formatted = `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]}`;
                return {
                  label: formatted,
                  value: w.weightKg,
                };
              }),
              'KG',
              '#0A84FF'
            )}
          </div>

          {/* Weight Log Table */}
          <div className="gym-card p-5 border-[#242830]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8E95A5] mb-3">
              Recorded Weigh-Ins
            </h3>
            <div className="space-y-2">
              {[...sortedWeights].reverse().map((w) => (
                <div
                  key={w.id}
                  className="bg-[#090A0A] p-3 rounded-xl border border-[#1F2228] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[#8E95A5]">{w.date}</span>
                  <span className="font-black text-white text-sm">{w.weightKg} KG</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
