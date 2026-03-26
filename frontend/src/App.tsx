import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAppStore } from "./store/useStore";
import { useHabits, useUnarchiveHabit } from "./hooks/useHabits";
import { useAnalytics } from "./hooks/useAnalytics";
import { HabitCard } from "./components/HabitCard";
import { StatBlock } from "./components/StatBlock";
import { AddHabitModal } from "./components/AddHabitModal";
import { HistoryTimeline } from "./components/HistoryTimeline";
import { CompletionTrendChart, BiometricHeatmap } from "./components/AnalyticsCharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  LayoutGrid, 
  Activity, 
  History as HistoryIcon, 
  BarChart3, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock,
  TrendingUp,
  BrainCircuit,
  Download,
  Archive,
  RefreshCw,
  X
} from "lucide-react";
import { useState } from "react";
import { api } from "./api/client";

const queryClient = new QueryClient();

// ================= MODULE: ARCHIVE MODAL =================
const ArchiveModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { data: archivedHabits, isLoading } = useQuery({
    queryKey: ["habits", "archived"],
    queryFn: async () => (await api.get("/habits/archived")).data,
    enabled: isOpen
  });

  const { mutate: unarchive } = useUnarchiveHabit();
  const { showNotification } = useAppStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[3rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white tracking-widest uppercase italic">Neural Archive</h2>
                <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
                   <X className="w-6 h-6" />
                </button>
             </div>

             {isLoading ? (
               <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>
             ) : (archivedHabits?.length === 0 ? (
               <div className="py-20 text-center text-white/20 font-black uppercase tracking-widest">No Archived Systems Detected</div>
             ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                  {archivedHabits?.map((habit: any) => (
                    <div key={habit.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between group">
                       <div>
                          <p className="text-xl font-black text-white">{habit.name}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Archived on biometric baseline</p>
                       </div>
                       <button 
                          onClick={() => unarchive(habit.id, { onSuccess: () => showNotification(`Restored ${habit.name}`) })}
                          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-500 hover:text-black transition-all duration-500 uppercase font-black text-[10px] tracking-widest"
                       >
                          <RefreshCw className="w-4 h-4" />
                          Unarchive
                       </button>
                    </div>
                  ))}
                </div>
             ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ================= MODULE: OVERVIEW =================
const Overview = () => {
  const { data: habits, isLoading: isLoadingHabits } = useHabits();
  const { stats, insights, isLoading: isLoadingStats } = useAnalytics();
  const { setAddHabitModal, showNotification } = useAppStore();
  const [isArchiveOpen, setArchiveOpen] = useState(false);

  const handleGlobalExport = async () => {
    try {
        const response = await api.get('/analytics/export/overall', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `overall_habits_stats.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showNotification("Exported global statistics");
    } catch (e) {
        showNotification("Failed to export statistics", "error");
    }
  }

  if (isLoadingHabits || isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <span className="text-sm font-black text-white/20 uppercase tracking-[0.3em] font-mono">
          Syncing Biometric Core
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-24">
      {/* GLOBAL HUD */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBlock label="Consistency" value={`${stats.overall_consistency}%`} sub="+1.2% Trend" delay={0.1} />
          <StatBlock label="Active Habits" value={stats.total_habits} sub="Primary Focus" delay={0.2} />
          <StatBlock label="Elite Pattern" value={stats.most_consistent} sub={`at ${stats.most_consistent_value}%`} delay={0.3} />
          <StatBlock label="Peak Streak" value={stats.longest_streak_value} sub={`via ${stats.longest_streak}`} delay={0.4} />
        </div>
      )}

      {/* INSIGHT FEED */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-wrap gap-4">
            {insights.map((insight: string, idx: number) => (
              <div key={idx} className="px-6 py-4 rounded-[2rem] bg-white/[0.04] border border-white/5 text-sm font-bold text-purple-400 flex items-center gap-4 hover:border-purple-500/30 transition-all duration-500">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
                {insight}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HABIT GRID */}
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-500/10 rounded-[1.5rem] border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <LayoutGrid className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">HABIT MODULES</h2>
              <p className="text-gray-500 text-xs font-bold font-mono tracking-widest uppercase mt-1">Active daily tactical tasks</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <button onClick={() => setArchiveOpen(true)} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
                <Archive className="w-6 h-6" />
             </button>
             <button onClick={handleGlobalExport} className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                <Download className="w-4 h-4" />
                Export CSV
             </button>
             <button onClick={() => setAddHabitModal(true)} className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-white text-black font-black text-sm uppercase tracking-tighter hover:bg-purple-500 hover:text-white transition-all shadow-xl group">
                <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                Deploy Habit
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {habits?.map((habit: any) => (
              <HabitCard key={habit.id} id={habit.id} name={habit.name} streak={habit.streak} consistency={habit.consistency_30d} is_checked_today={habit.is_checked_today} />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <ArchiveModal isOpen={isArchiveOpen} onClose={() => setArchiveOpen(false)} />
    </div>
  );
};

// ================= MODULE: ANALYTICS =================
const Analytics = () => {
    const { data: conclusions, isLoading } = useQuery({
        queryKey: ["analytics", "conclusions"],
        queryFn: async () => (await api.get("/analytics/conclusions")).data
    });

    return (
        <div className="space-y-16">
           <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-500/10 rounded-[1.5rem] border border-purple-500/20">
                 <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white tracking-tighter">NEURAL ANALYTICS</h2>
                 <p className="text-gray-500 text-xs font-bold font-mono tracking-widest uppercase mt-1">Performance Interpretation & Trends</p>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2"><CompletionTrendChart /></div>
              <div className="xl:col-span-1"><BiometricHeatmap /></div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/5">
                 <div className="flex items-center gap-4 mb-8">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Consistency Prediction</h3>
                 </div>
                 <p className="text-gray-400 font-medium leading-relaxed italic border-l-2 border-emerald-500/20 pl-6">
                    "Based on your 30-day velocity, your consistency is projected to stabilize at 82% for the next sprint. Maintaining current streaks is key to biometric baseline growth."
                 </p>
              </div>
              <div className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px]" />
                 <div className="flex items-center gap-4 mb-8">
                    <BrainCircuit className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter text-glow">Insight Engine v2</h3>
                 </div>
                 
                 {isLoading ? (
                    <div className="flex items-center gap-3 animate-pulse text-white/10 uppercase font-black text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Log Patterns...
                    </div>
                 ) : (
                    <div className="space-y-6">
                        {conclusions?.map((c: string, idx: number) => (
                            <div key={idx} className="flex gap-4 group">
                                <span className="text-purple-500 font-black pt-1">0{idx+1}</span>
                                <p className="text-gray-400 text-sm font-medium tracking-tight leading-relaxed group-hover:text-white transition-colors">
                                    {c}
                                </p>
                            </div>
                        ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
    )
}

// ================= MODULE: HISTORY =================
const History = () => {
  const { data: habits } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  return (
    <div className="space-y-16">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20">
                <HistoryIcon className="w-8 h-8 text-emerald-500" />
             </div>
             <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">NEURAL LOGS</h2>
                <p className="text-gray-500 text-xs font-bold font-mono tracking-widest uppercase mt-1">Full Historical Audit Trail</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-3xl border border-white/5">
             {habits?.map((habit: any) => (
                <button key={habit.id} onClick={() => setSelectedHabitId(habit.id)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${selectedHabitId === habit.id ? "bg-white text-black shadow-xl scale-105" : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"}`}>
                   {habit.name}
                </button>
             ))}
          </div>
       </div>

       {selectedHabitId ? <HistoryTimeline habitId={selectedHabitId} /> : (
          <div className="py-40 text-center border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6"><Clock className="w-8 h-8 text-white/10" /></div>
             <p className="text-white/20 text-sm font-black uppercase tracking-[0.4em]">Select A Module To Audit</p>
          </div>
       )}
    </div>
  );
}

function MainLayout() {
  const { activeTab, setActiveTab, notification } = useAppStore();
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/5 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-125 contrast-125 mix-blend-overlay" />
      </div>
      <nav className="sticky top-0 z-[100] border-b border-white/10 bg-black/40 backdrop-blur-3xl px-10 py-7 flex items-center justify-between">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:rotate-12 transition-transform duration-500"><BarChart3 className="w-7 h-7 text-white" /></div>
           <div><h1 className="text-3xl font-black text-white tracking-widest uppercase leading-none">CORE <span className="text-gray-700">PRIME</span></h1><div className="flex items-center gap-1.5 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Biometric Uplink Live</span></div></div>
        </div>
        <div className="hidden lg:flex p-1.5 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-3xl">
          {[{ id: 'overview', icon: LayoutGrid, color: 'hover:text-purple-400' }, { id: 'analytics', icon: Activity, color: 'hover:text-amber-400' }, { id: 'history', icon: HistoryIcon, color: 'hover:text-emerald-400' }].map(({ id, icon: Icon, color }) => (
            <button key={id} onClick={() => setActiveTab(id as any)} className={`flex items-center gap-3 px-10 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-700 group ${activeTab === id ? "bg-white text-black shadow-xl scale-105" : `text-gray-500 ${color}`}`}>
              <Icon className={`w-4 h-4 transition-transform duration-700 ${activeTab === id ? "" : "group-hover:scale-125 group-hover:rotate-12"}`} />
              {id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-10">
           <div className="hidden xl:flex flex-col items-end"><span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Last Sync</span><span className="text-[10px] font-bold text-white uppercase font-mono tracking-tighter">00:10:42 ms</span></div>
           <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-white/5 animate-pulse" />
        </div>
      </nav>
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }} className="fixed bottom-10 left-1/2 z-[300] px-8 py-5 rounded-[2rem] bg-black border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center gap-4 min-w-[320px]">
            {notification.type === "success" ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
            <span className="text-sm font-black uppercase tracking-widest text-white">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="relative z-10 max-w-[1440px] mx-auto px-10 py-24">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 50, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 1.02 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'history' && <History />}
          </motion.div>
        </AnimatePresence>
      </main>
      <AddHabitModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
