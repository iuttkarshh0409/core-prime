import { motion } from "framer-motion";
import { Check, X, Clock, MessageSquareQuote, Loader2, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export const HistoryTimeline = ({ habitId }: { habitId: number }) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs", habitId],
    queryFn: async () => (await api.get(`/logs/${habitId}`)).data,
    enabled: !!habitId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-purple-500/40 animate-spin" />
        <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.3em]">
          Accessing Neural History
        </span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
         <Info className="w-8 h-8 text-white/5 mx-auto mb-4" />
         <p className="text-white/10 text-xs font-black uppercase tracking-widest">No Log Data Detected</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 border-l border-white/5 space-y-12 py-10">
      {logs.map((log: any, idx: number) => (
        <motion.div 
          key={idx} 
          initial={{ opacity: 0, x: -10 }} 
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(idx * 0.05, 1) }}
          className="relative group"
        >
          {/* TIMELINE DOT */}
          <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-2 bg-black z-10 transition-all duration-700 ${
            log.status === 1 
              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
              : "border-rose-500/30 group-hover:border-rose-500"
          }`} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
               <span className="text-lg font-black text-white tracking-widest tabular-nums font-mono uppercase">
                  {log.date}
               </span>
               <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border transition-colors ${
                 log.status === 1 
                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
                    : "bg-rose-500/5 text-rose-500 border-rose-500/20"
               }`}>
                 {log.status === 1 ? "Protocol Success" : "Data Gap"}
               </span>
            </div>
            
            {log.reflection && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 backdrop-blur-md group-hover:border-purple-500/20 transition-all duration-700"
              >
                <MessageSquareQuote className="w-5 h-5 text-purple-500/40 shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm font-medium leading-relaxed tracking-tight italic">
                  "{log.reflection}"
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
