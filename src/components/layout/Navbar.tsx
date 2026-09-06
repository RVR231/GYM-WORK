import React, { useState, useEffect } from 'react';
import { Dumbbell, Cloud, CloudOff, LogIn, LogOut, Info, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured, signInWithGoogle, signOut } from '../../lib/supabase';
import { UserProfile } from '../../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err: any) {
      alert(err.message || 'Failed to initiate Google Sign-In');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      setUser(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090A0A]/95 backdrop-blur-md border-b border-[#1F2228] px-4 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center text-black font-black shadow-glow-accent-sm group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>RVR</span>
              <span className="text-[#CCFF00]">_GYM</span>
            </div>
            <p className="text-[10px] text-[#8E95A5] font-medium tracking-widest uppercase">
              Personal Gym Tracker
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121417] p-1 rounded-xl border border-[#242830]">
          {[
            { id: 'home', label: 'Home' },
            { id: 'workout', label: 'Workout' },
            { id: 'history', label: 'History' },
            { id: 'progress', label: 'Progress' },
            { id: 'exercises', label: 'Exercises' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                currentTab === item.id
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-[#8E95A5] hover:text-white hover:bg-[#181B20]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User / Cloud Status Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cloud Status Indicator */}
          {isSupabaseConfigured ? (
            user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-[#121417] border border-[#242830] px-2.5 py-1 rounded-full text-[11px] text-[#CCFF00]">
                  <Cloud className="w-3.5 h-3.5 text-[#30D158]" />
                  <span className="font-semibold text-white truncate max-w-[110px]">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-[#181B20] text-[#8E95A5] hover:text-[#FF453A] hover:bg-[#242830] transition-colors border border-[#242830]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In with</span> Google
              </button>
            )
          ) : (
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181B20] border border-[#2F343E] text-[11px] text-[#8E95A5] hover:text-white hover:border-[#CCFF00]/50 transition-colors"
              title="Cloud sync & local storage info"
            >
              <CloudOff className="w-3.5 h-3.5 text-[#FF9F0A]" />
              <span className="hidden sm:inline font-medium">Local Storage Mode</span>
              <Info className="w-3 h-3 text-[#CCFF00]" />
            </button>
          )}
        </div>
      </div>

      {/* Cloud Setup Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121417] border border-[#2F343E] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-lg mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>RVR_GYM Storage & Sync</span>
            </div>
            <p className="text-xs text-[#8E95A5] leading-relaxed mb-4">
              Your workouts, body weight, and custom exercises are currently stored safely in your browser's fast local storage.
            </p>

            <div className="bg-[#181B20] p-3.5 rounded-xl border border-[#242830] mb-4 text-xs space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Want Cloud Sync & Google Sign-In?</span>
              </div>
              <p className="text-[#8E95A5]">
                1. Add your Supabase URL & Anon Key to your project's <code className="text-[#CCFF00] bg-black/40 px-1 py-0.5 rounded">.env</code> file.
              </p>
              <p className="text-[#8E95A5]">
                2. Run the provided <code className="text-[#CCFF00] bg-black/40 px-1 py-0.5 rounded">supabase/schema.sql</code> script in your Supabase SQL Editor.
              </p>
              <p className="text-[#8E95A5]">
                3. Enable Google Auth in Supabase Authentication &gt; Providers.
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#CCFF00] text-black font-bold text-xs tracking-wider uppercase hover:bg-[#B8E600] transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
