import React, { useState } from 'react';
import { TabType, WorkoutCategory, CompletedWorkout } from './types';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './views/DashboardView';
import { WorkoutView } from './views/WorkoutView';
import { HistoryView } from './views/HistoryView';
import { ProgressView } from './views/ProgressView';
import { ExercisesView } from './views/ExercisesView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeWorkoutCategory, setActiveWorkoutCategory] = useState<WorkoutCategory>('PUSH');
  const [editingWorkout, setEditingWorkout] = useState<CompletedWorkout | null>(null);

  const handleStartWorkout = (category: WorkoutCategory) => {
    setEditingWorkout(null);
    setActiveWorkoutCategory(category);
    setCurrentTab('workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditWorkout = (workout: CompletedWorkout) => {
    setEditingWorkout(workout);
    setActiveWorkoutCategory(workout.workoutType);
    setCurrentTab('workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkoutSaved = () => {
    setEditingWorkout(null);
    setCurrentTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelWorkout = () => {
    setEditingWorkout(null);
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090A0A] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab: TabType) => {
          if (currentTab === 'workout' && !editingWorkout) {
            // allow navigating away freely
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content View */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 pb-24 md:pb-12 max-w-6xl w-full mx-auto">
        {currentTab === 'home' && (
          <DashboardView
            onStartWorkout={handleStartWorkout}
            onNavigateToHistory={() => {
              setCurrentTab('history');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToProgress={() => {
              setCurrentTab('progress');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'workout' && (
          <WorkoutView
            initialCategory={activeWorkoutCategory}
            editingWorkout={editingWorkout}
            onWorkoutSaved={handleWorkoutSaved}
            onCancel={handleCancelWorkout}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            onEditWorkout={handleEditWorkout}
            onStartNewWorkout={() => handleStartWorkout('PUSH')}
          />
        )}

        {currentTab === 'progress' && <ProgressView />}

        {currentTab === 'exercises' && <ExercisesView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isWorkoutActive={currentTab === 'workout'}
      />
    </div>
  );
};

export default App;
