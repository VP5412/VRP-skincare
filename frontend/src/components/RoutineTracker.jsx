import { useState } from 'react';
import { api } from '../api';

export default function RoutineTracker({ userProfile }) {
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(userProfile?.streak_count || 0);
  const [completed, setCompleted] = useState(false);

  // Derive routines safely from the generative database JSON map
  let routineMap = null;
  if (userProfile?.daily_routine_json) {
     try {
       routineMap = JSON.parse(userProfile.daily_routine_json);
     } catch (e) {}
  }

  const morningRoutine = routineMap?.morning_routine || [];
  const nightRoutine = routineMap?.night_routine || [];
  
  if (!routineMap || (morningRoutine.length === 0 && nightRoutine.length === 0)) {
    return (
      <div className="p-6 bg-surface-container-low rounded-2xl flex items-center justify-between opacity-50">
        <p className="text-on-surface-variant font-headline text-sm font-bold">Take a 3D Facemap Scan to generate your personalized Daily Routine.</p>
      </div>
    );
  }

  const handleComplete = async () => {
    if (completed) return;
    setLoading(true);
    try {
      const resp = await api.checkRoutine();
      setStreak(resp.streak);
      setCompleted(true);
    } catch (error) {
      console.error('Failed to log routine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-primary-container/10 border border-primary/20 rounded-3xl animate-fade-in-up shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-headline font-extrabold text-xl text-on-surface flex items-center gap-2">
            Daily Rituals
            {completed && <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">Cross off today's habits based on your clinical AI plan.</p>
        </div>
        <div className="flex flex-col items-center bg-orange-100/50 dark:bg-orange-900/20 px-4 py-2 rounded-2xl border border-orange-500/20 shrink-0">
          <span className={`material-symbols-outlined text-3xl ${streak >= 7 ? 'text-red-500 animate-pulse' : streak > 0 ? 'text-orange-500' : 'text-outline-variant'} drop-shadow-md`} style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          <span className="font-headline font-bold text-sm text-on-surface">{streak} Day{streak !== 1 && 's'}</span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
         {morningRoutine.length > 0 && (
            <div>
               <p className="text-xs tracking-wider uppercase font-bold text-primary mb-3 pl-1 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px]">wb_sunny</span> Morning Application
               </p>
               <div className="space-y-2">
                 {morningRoutine.map((product, idx) => (
                   <label key={idx} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm group border border-outline-variant/10">
                     <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-transparent" />
                     <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{product}</span>
                   </label>
                 ))}
               </div>
            </div>
         )}
         
         {nightRoutine.length > 0 && (
            <div>
               <p className="text-xs tracking-wider uppercase font-bold text-tertiary mb-3 pl-1 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px]">clear_night</span> Evening Application
               </p>
               <div className="space-y-2">
                 {nightRoutine.map((product, idx) => (
                   <label key={idx} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm group border border-outline-variant/10">
                     <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-tertiary focus:ring-tertiary bg-transparent" />
                     <span className="text-sm font-medium text-on-surface group-hover:text-tertiary transition-colors">{product}</span>
                   </label>
                 ))}
               </div>
            </div>
         )}
      </div>

      <button
        onClick={handleComplete}
        disabled={loading || completed}
        className={`w-full py-4 rounded-2xl font-headline font-bold text-center transition-all ${
          completed 
            ? 'bg-surface-container text-primary border border-primary/20 cursor-not-allowed'
            : 'bg-primary text-on-primary hover:bg-primary-dim active:scale-[0.98] shadow-lg shadow-primary/30'
        }`}
      >
        {loading ? 'Logging Adherence...' : completed ? 'Routine Logged for Today!' : 'Mark Routine Complete'}
      </button>
    </section>
  );
}
