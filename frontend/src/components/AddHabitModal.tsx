import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../store/useStore";
import { useAddHabit } from "../hooks/useHabits";

export const AddHabitModal = () => {
  const { isAddHabitModalOpen, setAddHabitModal, showNotification } = useAppStore();
  const [name, setName] = useState("");
  const { mutate: addHabit, isPending } = useAddHabit();

  const handleDeploy = () => {
    if (!name.trim()) return;
    addHabit(name, {
      onSuccess: () => {
        setName("");
        setAddHabitModal(false);
        showNotification(`Habit "${name}" deployed successfully`);
      },
    });
  };

  return (
    <AnimatePresence>
      {isAddHabitModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddHabitModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* MODAL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg p-10 rounded-[3rem] border border-white/10 bg-[#0c0c0c] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* GLOW DECOR */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px]" />

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">NEURAL DEPLOY</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Initiating New Optimization Habit</p>
              </div>
              <button 
                 onClick={() => setAddHabitModal(false)}
                 className="p-2 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Habit Identification</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MORNING_FASTING"
                  className="w-full h-16 px-6 bg-white/[0.03] border border-white/10 rounded-2xl text-xl font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleDeploy()}
                />
              </div>

              <button
                disabled={isPending || !name.trim()}
                onClick={handleDeploy}
                className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase text-sm tracking-tighter flex items-center justify-center gap-3 hover:bg-purple-500 hover:text-white transition-all duration-500 disabled:opacity-30 disabled:pointer-events-none"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Deploy To Biometric Core
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
