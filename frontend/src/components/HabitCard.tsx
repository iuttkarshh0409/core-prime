import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Flame, TrendingUp, Loader2, Archive, Download, CheckCircle2, ShieldAlert } from "lucide-react";
import { useCheckInHabit, useArchiveHabit } from "../hooks/useHabits";
import { useAppStore } from "../store/useStore"
import { cn } from "../lib/utils";
import { api } from "../api/client"

interface HabitCardProps {
  id: number;
  name: string;
  streak: number;
  consistency: number;
  is_checked_today: boolean;
}

export const HabitCard = ({ id, name, streak, consistency, is_checked_today }: HabitCardProps) => {
  const { mutate: checkIn, isPending, variables } = useCheckInHabit();
  const { mutate: archiveHabit } = useArchiveHabit();
  const { showNotification } = useAppStore();

  const isMarkingDone = isPending && variables?.status === 1;
  const isMarkingMissed = isPending && variables?.status === 0;

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        const response = await api.get(`/analytics/export/${id}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `habit_${id}_stats.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showNotification("Stats exported.");
    } catch (e) {
        showNotification("Failed to export status.", "error");
    }
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Stop tracking "${name}"? You can restore it later.`)) {
       archiveHabit(id, {
         onSuccess: () => showNotification(`Stopped tracking ${name}`),
         onError: () => showNotification("Failed to stop tracking.", "error")
       });
    }
  }

  const handleCheckInStatus = (status: number) => {
      checkIn({ habitId: id, status }, {
          onSuccess: () => {
              const msg = status === 1 ? "Nice work!" : "Marked as skipped.";
              showNotification(msg);
          }
      });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative p-6 rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05]"
    >
      {/* Quick Actions */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleExport} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all">
              <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleArchive} className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-all">
              <Archive className="w-3.5 h-3.5" />
          </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{name}</h3>
            {is_checked_today && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className="flex items-center gap-3">
             <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${consistency}%` }}
                    className="h-full bg-primary"
                />
             </div>
             <span className="text-[10px] font-bold text-muted ml-auto font-mono">{consistency}% CONSISTENT</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
           <Flame className={cn("w-4 h-4", streak > 0 ? "text-primary animate-pulse fill-primary" : "text-muted")} />
           <span className={cn("text-xs font-bold font-mono tracking-tighter uppercase", streak > 0 ? "text-primary" : "text-muted")}>
             {streak} day streak
           </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
           <button
             disabled={is_checked_today || isPending}
             onClick={() => handleCheckInStatus(1)}
             className={cn(
               "flex items-center justify-center gap-2 h-10 rounded-2xl font-bold text-xs transition-all",
               is_checked_today 
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default" 
                : "bg-white/5 text-muted hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(34,197,129,0.3)] border border-transparent"
             )}
           >
             {isMarkingDone ? <Loader2 className="w-4 h-4 animate-spin" /> : is_checked_today ? "Completed" : "Mark as Done"}
           </button>
           <button
             disabled={is_checked_today || isPending}
             onClick={() => handleCheckInStatus(0)}
             className={cn(
               "flex items-center justify-center gap-2 h-10 rounded-2xl font-bold text-xs transition-all",
               is_checked_today 
                ? "bg-white/[0.02] text-muted opacity-20 cursor-default" 
                : "bg-white/5 text-muted hover:bg-rose-500 hover:text-white border border-transparent"
             )}
           >
             {isMarkingMissed ? <Loader2 className="w-4 h-4 animate-spin" /> : "Skip Day"}
           </button>
        </div>
      </div>
    </motion.div>
  );
};
