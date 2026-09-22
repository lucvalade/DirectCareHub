'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { ClipboardList, Check, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RunbookTask {
  id: string;
  title: string;
  scheduled_time: string;
  is_completed: boolean;
  completed_at?: any;
  order: number;
}

const DEFAULT_SEED_TASKS = [
  { id: 'task_1', title: 'Bowel Routine & Catheter Care', scheduled_time: '08:00 AM', is_completed: false, order: 1 },
  { id: 'task_2', title: 'Arjo Ceiling Lift Transfer to Wheelchair', scheduled_time: '08:45 AM', is_completed: false, order: 2 },
  { id: 'task_3', title: 'Morning Medications (See Medisafe Vault)', scheduled_time: '09:15 AM', is_completed: false, order: 3 },
  { id: 'task_4', title: 'Passive Range of Motion (Upper Limbs)', scheduled_time: '10:30 AM', is_completed: false, order: 4 },
];

export default function InteractiveRunbook({ shiftId, userRole }: { shiftId: string, userRole: 'employer' | 'attendant' }) {
  const [tasks, setTasks] = useState<RunbookTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shiftId) return;

    const tasksRef = collection(db, 'shifts', shiftId, 'tasks');
    const q = query(tasksRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed default tasks if empty
        try {
          for (const task of DEFAULT_SEED_TASKS) {
            await setDoc(doc(db, 'shifts', shiftId, 'tasks', task.id), task);
          }
        } catch (seedErr) {
          console.warn("Failed to seed default tasks in Firestore:", seedErr);
          setTasks(DEFAULT_SEED_TASKS);
          setLoading(false);
          return;
        }
      }

      const fetchedTasks = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as RunbookTask[];
      
      setTasks(fetchedTasks.length > 0 ? fetchedTasks : DEFAULT_SEED_TASKS);
      setLoading(false);
    }, (error) => {
      console.error("Failed to sync runbook tasks:", error);
      // Fallback to local state if firestore fails
      setTasks(DEFAULT_SEED_TASKS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shiftId]);

  const toggleTaskStatus = async (task: RunbookTask) => {
    const taskRef = doc(db, 'shifts', shiftId, 'tasks', task.id);
    const newStatus = !task.is_completed;
    
    // Optimistic local update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: newStatus } : t));

    try {
      await updateDoc(taskRef, {
        is_completed: newStatus,
        completed_at: newStatus ? serverTimestamp() : null,
        completed_by_role: newStatus ? userRole : null,
      });

      if (newStatus) {
        toast.success(`${task.title} completed`, {
          style: { background: '#020617', color: '#22d3ee', border: '1px solid rgba(34, 211, 238, 0.3)' },
          icon: <Check className="w-5 h-5 text-[#22d3ee]" />
        });
      }
    } catch (error) {
      console.warn("Firestore update notice:", error);
      // Keep optimistic update for smooth UX
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#22d3ee]" />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progressPercentage = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="bg-[#020617] rounded-3xl shadow-2xl border border-white/10 overflow-hidden text-white w-full max-w-3xl">
      {/* Progress Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Shift Runbook</h2>
          <span className="text-sm font-semibold px-3 py-1 bg-[#0224bb]/30 text-cyan-400 rounded-full border border-[#0224bb]">
            {completedCount} / {tasks.length} Completed
          </span>
        </div>
        
        {/* Neon Cyan Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-[#22d3ee] h-2.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Interactive Task List */}
      <div className="p-6 space-y-4">
        {tasks.map((task) => (
          <button 
            key={task.id}
            type="button"
            onClick={() => toggleTaskStatus(task)}
            aria-checked={task.is_completed}
            role="checkbox"
            className={`
              w-full group flex items-center justify-between p-5 transition-all duration-300 rounded-2xl border min-h-[88px] text-left focus:outline-none focus:ring-4 focus:ring-[#7C3AED] cursor-pointer
              ${task.is_completed 
                ? 'bg-white/5 border-emerald-500/30 opacity-60' 
                : 'bg-white/10 border-white/10 hover:border-[#7C3AED] hover:bg-white/15'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0
                ${task.is_completed 
                  ? 'bg-emerald-500/20 border-emerald-500/50' 
                  : 'bg-[#0224bb]/30 border border-[#0224bb] group-hover:border-[#7C3AED]'
                }
              `}>
                <ClipboardList className={`w-6 h-6 ${task.is_completed ? 'text-emerald-400' : 'text-[#7C3AED]'}`} />
              </div>
              
              <div>
                <p className={`text-lg font-semibold transition-all ${task.is_completed ? 'text-slate-400 line-through decoration-emerald-500/50' : 'text-slate-100 group-hover:text-[#22d3ee]'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-400">{task.scheduled_time}</p>
                </div>
              </div>
            </div>
            
            {/* AODA Compliant Visual Toggle Indicator */}
            <div className={`
              w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0
              ${task.is_completed 
                ? 'bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'border-white/20 group-hover:border-[#22d3ee]'
              }
            `}>
              <Check className={`w-6 h-6 transition-transform duration-300 ${task.is_completed ? 'scale-100 text-[#020617]' : 'scale-0 text-transparent'}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
