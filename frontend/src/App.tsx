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
import { LandingPage } from "./LandingPage";
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
  Download,
  Archive,
  RefreshCw,
  X,
  Zap,
  Sparkles,
  Layout
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-card border border-white/10 rounded-3xl p-10 shadow-2xl"
          >
             <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                   <h2 className="text-2xl font-bold text-white tracking-tight">Archived Habits</h2>
                   <p className="text-xs text-muted font-medium">Recently paused habits you can restore anytime.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-muted hover:text-white transition-all">
                   <X className="w-5 h-5" />
                </button>
             </div>

             {isLoading ? (
               <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
             ) : (archivedHabits?.length === 0 ? (
               <div className="py-20 text-center text-muted font-medium border-2 border-dashed border-white/5 rounded-2xl">Your archive is currently empty.</div>
             ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {archivedHabits?.map((habit: any) => (
                    <div key={habit.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                       <div>
                          <p className="text-base font-semibold text-white">{habit.name}</p>
                          <p className="text-[10px] text-muted font-medium mt-0.5">Archived on {new Date().toLocaleDateString()}</p>
                       </div>
                       <button 
                          onClick={() => unarchive(habit.id, { onSuccess: () => showNotification(`Restored ${habit.name}`) })}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-primary hover:text-white transition-all text-xs font-bold"
                       >
                          <RefreshCw className="w-3 h-3" />
                          Restore
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
        showNotification("Stats exported successfully.");
    } catch (e) {
        showNotification("Failed to export statistics", "error");
    }
  }

  if (isLoadingHabits || isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary"
        />
        <span className="text-sm font-medium text-muted animate-pulse">Setting up your workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* SUMMARY DASHBOARD */}
      <div className="bento-grid">
         {/* Main Stats Area */}
         <div className="col-span-12 xl:col-span-8 p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
            <div className="flex flex-col gap-1 mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl"><Layout className="w-5 h-5 text-primary" /></div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Your Progress</h2>
               </div>
               <p className="text-muted text-xs font-medium ml-10">An overview of your recent consistency and activity.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBlock label="Consistency" value={`${stats?.overall_consistency}%`} sub="+1.2% this week" />
              <StatBlock label="Habits Tracking" value={stats?.total_habits} sub="Active habits" />
              <StatBlock label="Top Performer" value={stats?.most_consistent} sub={`${stats?.most_consistent_value}% success`} />
              <StatBlock label="Best Streak" value={stats?.longest_streak_value} sub="Days in a row" />
            </div>
         </div>

         {/* Coach Feedback */}
         <div className="col-span-12 xl:col-span-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-accent/10 rounded-xl"><Sparkles className="w-5 h-5 text-accent" /></div>
               <h3 className="text-xl font-bold text-white tracking-tight">Daily Coach</h3>
            </div>
            <div className="space-y-3">
               <AnimatePresence>
                {insights.slice(0, 3).map((insight: string, idx: number) => (
                  <motion.div 
                    key={idx} 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-2xl bg-white/[0.03] text-xs font-medium text-white/80 leading-relaxed"
                  >
                    {insight}
                  </motion.div>
                ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Habit List Header */}
         <div className="col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10">
           <div className="space-y-1">
             <h2 className="text-3xl font-bold text-white tracking-tight">Your Daily Habits</h2>
             <p className="text-muted text-sm font-medium">Keep track of your recurring activities below.</p>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={() => setArchiveOpen(true)} 
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-white transition-all group"
                title="View Archived Habits"
              >
                 <Archive className="w-5 h-5" />
              </button>
              <button 
                onClick={handleGlobalExport} 
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-white transition-all group"
                title="Export Data"
              >
                 <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setAddHabitModal(true)} 
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white text-black font-bold text-sm tracking-tight hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                 <Plus className="w-5 h-5" />
                 New Habit
              </button>
           </div>
         </div>

         {/* HABIT LIST */}
         <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
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
        <div className="space-y-12">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-2xl">
                 <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                 <h2 className="text-3xl font-bold text-white tracking-tight">Performance Analytics</h2>
                 <p className="text-muted text-sm font-medium">A deeper look into your habits and behavioral trends.</p>
              </div>
           </div>

           <div className="bento-grid">
              {/* Trends */}
              <div className="col-span-12 xl:col-span-8 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-lg font-bold text-white tracking-tight">Consistency Trends</h3>
                     <span className="text-[10px] text-muted font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Last 30 Days</span>
                  </div>
                  <CompletionTrendChart />
              </div>

              {/* Heatmap */}
              <div className="col-span-12 xl:col-span-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                  <BiometricHeatmap />
              </div>

              {/* Insights Section */}
              <div className="col-span-12 lg:col-span-5 p-8 rounded-3xl bg-white/[0.02] border border-white/5 bg-gradient-to-br from-accent/5 to-transparent">
                 <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-white">Stability Observation</h3>
                 </div>
                 <p className="text-white/70 text-sm leading-relaxed font-medium">
                    "Based on your 30-day activity, your routine is becoming more stable. Keeping this pace for another week will likely establish these habits as long-term behaviors."
                 </p>
                 <div className="mt-8 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold">Predicting uplift</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-muted text-[10px] font-bold">94% Confidence</span>
                 </div>
              </div>

              {/* AI Conclusions */}
              <div className="col-span-12 lg:col-span-7 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                 <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Smart Conclusions</h3>
                 </div>
                 
                 {isLoading ? (
                    <div className="flex items-center gap-3 animate-pulse text-muted text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Identifying log patterns...
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conclusions?.map((c: string, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 group">
                                <p className="text-white/60 text-[11px] font-medium leading-relaxed group-hover:text-white transition-colors">
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
    <div className="space-y-12">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-white/5 rounded-2xl">
                <HistoryIcon className="w-8 h-8 text-muted" />
             </div>
             <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">Audit Trail</h2>
                <p className="text-muted text-sm font-medium">A chronological history of your habit logs.</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-2xl">
             {habits?.map((habit: any) => (
                <button key={habit.id} onClick={() => setSelectedHabitId(habit.id)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${selectedHabitId === habit.id ? "bg-white text-black shadow-lg" : "text-muted hover:text-white"}`}>
                   {habit.name}
                </button>
             ))}
          </div>
       </div>

       {selectedHabitId ? <HistoryTimeline habitId={selectedHabitId} /> : (
          <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6"><Clock className="w-8 h-8 text-white/5" /></div>
             <p className="text-muted text-sm font-bold uppercase tracking-widest font-mono">Select a habit to audit</p>
          </div>
       )}
    </div>
  );
}

function MainLayout() {
  const { activeTab, setActiveTab, notification } = useAppStore();
  const [showLanding, setShowLanding] = useState(() => {
    // Check if user has already "entered" in this session
    return !sessionStorage.getItem("cadence_entered");
  });

  const handleEnter = (tab?: 'overview' | 'analytics' | 'history') => {
    sessionStorage.setItem("cadence_entered", "true");
    if (tab) setActiveTab(tab);
    setShowLanding(false);
  };

  if (showLanding) {
    return <LandingPage onStart={handleEnter} />;
  }

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/20 overflow-x-hidden font-sans">
      {/* Visual Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-primary/5 blur-[150px] opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] bg-accent/5 blur-[150px] opacity-30" />
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-[100] border-b border-white/5 bg-background/80 backdrop-blur-2xl px-8 py-4 flex items-center justify-between">
        <div 
          onClick={() => {
            sessionStorage.removeItem("cadence_entered");
            setShowLanding(true);
          }} 
          className="flex items-center gap-4 cursor-pointer group"
          title="Return to Landing Page"
        >
           <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
              <BarChart3 className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight leading-none uppercase group-hover:text-primary transition-colors">Habit Cadence</h1>
              <div className="flex items-center gap-1.5 mt-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 <span className="text-[9px] font-bold text-accent uppercase tracking-widest">System Online</span>
              </div>
           </div>
        </div>

        <div className="hidden lg:flex p-1 bg-white/5 rounded-2xl border border-white/5">
          {[{ id: 'overview', icon: LayoutGrid, label: 'Overview' }, { id: 'analytics', icon: Activity, label: 'Analytics' }, { id: 'history', icon: HistoryIcon, label: 'History' }].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id as any)} className={`flex items-center gap-3 px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === id ? "bg-white text-black shadow-xl" : "text-muted hover:text-white"}`}>
              <Icon className={`w-4 h-4 ${activeTab === id ? "text-primary" : ""}`} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
           <div className="hidden xl:flex flex-col items-end">
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Last Sync</span>
              <span className="text-[10px] font-medium text-white/50">{new Date().toLocaleTimeString()}</span>
           </div>
           <div className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
           </div>
        </div>
      </nav>

      {/* Primary Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
          >
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'history' && <History />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="fixed bottom-10 right-10 z-[300] px-6 py-4 rounded-2xl bg-card border border-white/10 shadow-2xl flex items-center gap-4"
          >
            <div className={`p-2 rounded-lg ${notification.type === "success" ? "bg-accent/10 text-accent" : "bg-rose-500/10 text-rose-500"}`}>
               {notification.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <span className="text-sm font-bold text-white">{notification.message}</span>
            <button onClick={() => useAppStore.setState({ notification: null })} className="ml-2 text-muted hover:text-white">
               <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
