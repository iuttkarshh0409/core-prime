import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Flame, TrendingUp, Loader2, Archive, Download, CheckCircle2 } from "lucide-react";
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

  const handleExport = async () => {
    try {
        const response = await api.get(`/analytics/export/${id}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `habit_${id}_stats.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showNotification(`Exported statistics for ${name}`);
    } catch (e) {
        showNotification("Failed to export statistics", "error");
    }
  }

  const handleArchive = () => {
    if (window.confirm(`Are you sure you want to archive "${name}"?`)) {
       archiveHabit(id, {
         onSuccess: () => showNotification(`Archived ${name}`),
         onError: () => showNotification("Failed to archive habit", "error")
       });
    }
  }

  const handleCheckInStatus = (status: number) => {
      checkIn({ habitId: id, status }, {
          onSuccess: () => {
              const msg = status === 1 ? "Done for the day!" : "Marked missed for today.";
              showNotification(msg);
          }
      });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.2)" }}
      className="group relative p-8 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-white/[0.05] to-transparent pointer-events-none group-hover:via-white/[0.08] transition-all duration-700" />
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-500/5 blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-all duration-1000" />

      {/* HEADER: NAME & CONSISTENCY */}
      <div className="relative flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-purple-300 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border border-white/5 bg-black/40">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>{consistency}% CONSISTENCY</span>
          </div>
        </div>
        
        {/* ACTION TOOLS */}
        <div className="flex items-center gap-2">
            <button onClick={handleExport} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all" title="Export CSV">
                <Download className="w-4 h-4" />
            </button>
            <button onClick={handleArchive} className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 transition-all" title="Archive">
                <Archive className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* STREAK & STATUS INFO */}
      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-sm font-black text-orange-500 tabular-nums">
            {streak} DAY STREAK
          </span>
        </div>
      </div>

      {/* ACTION CLUSTER OR STATUS MESSAGE */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {is_checked_today ? (
            <motion.div 
               key="status"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10"
            >
               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Log Verified for Today</span>
            </motion.div>
          ) : (
            <motion.div 
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              <button
                disabled={isPending}
                onClick={() => handleCheckInStatus(1)}
                className={cn(
                  "flex-1 flex items-center justify-center h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 transition-all duration-500 disabled:opacity-50 group/btn",
                  !isPending && "hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                )}
              >
                {isMarkingDone ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Check className="w-6 h-6 group-hover/btn:scale-125 transition-transform" />
                )}
              </button>
              
              <button
                disabled={isPending}
                onClick={() => handleCheckInStatus(0)}
                className={cn(
                  "flex-1 flex items-center justify-center h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 transition-all duration-500 disabled:opacity-50 group/btn",
                  !isPending && "hover:bg-rose-500 hover:text-black hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                )}
              >
                {isMarkingMissed ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <X className="w-6 h-6 group-hover/btn:scale-125 transition-transform" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
