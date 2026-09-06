import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Plus, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  Check, 
  X
} from 'lucide-react';
import { ExerciseDefinition, WorkoutCategory, MuscleGroup } from '../types';
import { StorageService } from '../services/storageService';
import { WORKOUT_ICONS } from '../constants/defaultExercises';

export const ExercisesView: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'ALL'>('ALL');
  
  // Modal / form states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newExName, setNewExName] = useState<string>('');
  const [newExCategory, setNewExCategory] = useState<WorkoutCategory>('PUSH');
  const [newExMuscleGroup, setNewExMuscleGroup] = useState<MuscleGroup>('Chest');

  // Edit states
  const [editingExId, setEditingExId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<WorkoutCategory>('PUSH');
  const [editMuscleGroup, setEditMuscleGroup] = useState<MuscleGroup>('Chest');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = () => {
    const list = StorageService.getExercises();
    setExercises(list);
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    StorageService.saveCustomExercise(newExName, newExCategory, newExMuscleGroup);
    setNewExName('');
    setShowAddModal(false);
    loadExercises();
  };

  const startEditing = (ex: ExerciseDefinition) => {
    setEditingExId(ex.id);
    setEditName(ex.name);
    setEditCategory(ex.category);
    setEditMuscleGroup(ex.muscleGroup);
  };

  const cancelEditing = () => {
    setEditingExId(null);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    StorageService.updateExercise(id, {
      name: editName.trim(),
      category: editCategory,
      muscleGroup: editMuscleGroup,
    });
    setEditingExId(null);
    loadExercises();
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this exercise from your workout templates?')) {
      StorageService.deleteExercise(id);
      loadExercises();
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all exercises back to original Push/Pull/Legs factory defaults?')) {
      StorageService.resetExercisesToDefault();
      loadExercises();
    }
  };

  const filteredExercises = exercises.filter(
    (e) => selectedCategory === 'ALL' || e.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2228] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-[#CCFF00]" />
            <span>MANAGE EXERCISES</span>
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Add, rename, recategorize, or remove exercises
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-[#181B20] text-[#8E95A5] hover:text-white border border-[#242830] transition-colors"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-accent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Exercise</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex bg-[#121417] p-1 rounded-xl border border-[#242830] overflow-x-auto">
        {(['ALL', 'PUSH', 'PULL', 'LEGS'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex-1 text-center whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#CCFF00] text-black shadow-sm'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            {cat === 'ALL' ? 'ALL EXERCISES' : `${WORKOUT_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {filteredExercises.map((ex) => {
          const isEditing = editingExId === ex.id;

          if (isEditing) {
            return (
              <div
                key={ex.id}
                className="gym-card p-4 border-[#CCFF00] bg-[#15191F] space-y-3"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#CCFF00]">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#090A0A] border border-[#2F343E] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] block mb-1">
                      Workout Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as WorkoutCategory)}
                      className="w-full bg-[#090A0A] border border-[#2F343E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="PUSH">Push</option>
                      <option value="PULL">Pull</option>
                      <option value="LEGS">Legs</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5] block mb-1">
                      Muscle Group
                    </label>
                    <select
                      value={editMuscleGroup}
                      onChange={(e) => setEditMuscleGroup(e.target.value as MuscleGroup)}
                      className="w-full bg-[#090A0A] border border-[#2F343E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="Chest">Chest</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Triceps">Triceps</option>
                      <option value="Back">Back</option>
                      <option value="Biceps">Biceps</option>
                      <option value="Forearms">Forearms</option>
                      <option value="Legs">Legs</option>
                      <option value="Abs">Abs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 rounded-lg bg-[#181B20] text-xs font-bold text-[#8E95A5] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(ex.id)}
                    className="btn-accent px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={ex.id}
              className="gym-card p-4 border-[#242830] flex items-center justify-between hover:border-[#2F343E] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.5 rounded">
                      {ex.category}
                    </span>
                    <span className="text-[10px] text-[#8E95A5] font-semibold">
                      {ex.muscleGroup}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEditing(ex)}
                  className="p-2 rounded-lg bg-[#181B20] text-[#8E95A5] hover:text-[#CCFF00] transition-colors border border-[#242830]"
                  title="Rename or Change Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ex.id)}
                  className="p-2 rounded-lg bg-[#181B20] text-[#8E95A5] hover:text-[#FF453A] transition-colors border border-[#242830]"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExercise}
            className="gym-card border-[#2F343E] max-w-md w-full p-6 text-left shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1F2228] pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#CCFF00]" />
                <span>Add New Exercise</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8E95A5] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[#8E95A5] block mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Incline Dumbbell Curl"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="w-full bg-[#090A0A] border border-[#2F343E] rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#8E95A5] block mb-1">
                  Workout Category
                </label>
                <select
                  value={newExCategory}
                  onChange={(e) => {
                    const cat = e.target.value as WorkoutCategory;
                    setNewExCategory(cat);
                    if (cat === 'PUSH') setNewExMuscleGroup('Chest');
                    if (cat === 'PULL') setNewExMuscleGroup('Back');
                    if (cat === 'LEGS') setNewExMuscleGroup('Legs');
                  }}
                  className="w-full bg-[#090A0A] border border-[#2F343E] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="PUSH">Push</option>
                  <option value="PULL">Pull</option>
                  <option value="LEGS">Legs</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-[#8E95A5] block mb-1">
                  Muscle Group
                </label>
                <select
                  value={newExMuscleGroup}
                  onChange={(e) => setNewExMuscleGroup(e.target.value as MuscleGroup)}
                  className="w-full bg-[#090A0A] border border-[#2F343E] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="Chest">Chest</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Triceps">Triceps</option>
                  <option value="Back">Back</option>
                  <option value="Biceps">Biceps</option>
                  <option value="Forearms">Forearms</option>
                  <option value="Legs">Legs</option>
                  <option value="Abs">Abs</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2228]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#181B20] text-xs font-bold text-[#8E95A5] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-accent px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Add to Templates
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
