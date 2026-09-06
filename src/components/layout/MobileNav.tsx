import React from 'react';
import { Home, Dumbbell, Calendar, TrendingUp, Settings2 } from 'lucide-react';
import { TabType } from '../../types';

interface MobileNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isWorkoutActive?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  currentTab, 
  onSelectTab,
  isWorkoutActive = false 
}) => {
  interface NavItem {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasBadge?: boolean;
  }

  const tabs: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell, hasBadge: isWorkoutActive },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'exercises', label: 'Exercises', icon: Settings2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0D0F12]/95 backdrop-blur-lg border-t border-[#1F2228] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as TabType)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-[#CCFF00]' 
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-[#CCFF00] rounded-full mt-0.5 shadow-glow-accent-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
