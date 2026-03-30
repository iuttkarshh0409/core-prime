import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Target, 
  ChevronRight, 
  Activity,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-[#080a15] text-white selection:bg-primary/30 overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full opacity-50" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* HEADER */}
      <header className="relative z-50 px-8 py-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-2xl">
              <BarChart3 className="w-6 h-6" />
           </div>
           <h1 className="text-xl font-bold tracking-tight uppercase">Habit Cadence</h1>
        </div>
        <button 
          onClick={onStart}
          className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white hover:text-black transition-all"
        >
          Enter Dashboard
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-32 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
           >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">System v2.0 Live</span>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.1 }}
             className="text-6xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-balance"
           >
              Master Your <br />
              <span className="text-primary italic">Rhythm.</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-lg lg:text-xl text-white/50 font-medium max-w-md leading-relaxed border-l-2 border-white/10 pl-8"
           >
              Synchronize your daily routines with industrial-grade telemetry. 
              High-precision tracking for high-performance humans.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.3 }}
             className="flex flex-col sm:flex-row items-center gap-6"
           >
              <button 
                onClick={onStart}
                className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                 Initialize Core
                 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-3 text-white/40 hover:text-white transition-colors py-4 font-bold text-sm tracking-tight">
                 <Shield className="w-5 h-5" />
                 View Privacy Audit
              </button>
           </motion.div>
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, delay: 0.4 }}
           className="relative"
        >
           <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 animate-pulse" />
           <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <img 
                src="/hero.png" 
                alt="Habit Cadence Terminal" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a15] via-transparent to-transparent opacity-60" />
           </div>
           
           {/* FLOAT CARD 1 */}
           <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="absolute -top-10 -right-10 hidden xl:flex p-6 rounded-3xl glass-card items-center gap-4 border border-white/10 shadow-2xl"
           >
              <div className="p-3 bg-primary/20 rounded-2xl"><Activity className="w-6 h-6 text-primary" /></div>
              <div>
                 <p className="text-[10px] font-bold text-muted uppercase">Global Accuracy</p>
                 <p className="text-xl font-bold">99.8%</p>
              </div>
           </motion.div>

           {/* FLOAT CARD 2 */}
           <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
             className="absolute -bottom-10 -left-10 hidden xl:flex p-6 rounded-3xl glass-card items-center gap-4 border border-white/10 shadow-2xl"
           >
              <div className="p-3 bg-accent/20 rounded-2xl"><Zap className="w-6 h-6 text-accent" /></div>
              <div>
                 <p className="text-[10px] font-bold text-muted uppercase">System Uptime</p>
                 <p className="text-xl font-bold">100 / 100</p>
              </div>
           </motion.div>
        </motion.div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="relative z-10 py-32 px-8 max-w-7xl mx-auto border-t border-white/5">
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
               <h2 className="text-4xl font-bold tracking-tight">The Collective Stack.</h2>
               <p className="text-muted text-lg max-w-md">Our architecture is built for deterministic growth and biometric precision.</p>
            </div>
            <div className="flex items-center gap-12">
               <div className="flex flex-col">
                  <span className="text-3xl font-bold">4.2M</span>
                  <span className="text-[10px] font-bold text-muted uppercase">Logs Audited</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-bold">94%</span>
                  <span className="text-[10px] font-bold text-muted uppercase">Consistency Uplift</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Layers, title: "Human Telemetry", desc: "Detailed tracking of daily rituals with a minimal, human-analytical interface." },
              { icon: Target, title: "Cadence Engine", desc: "Proprietary algorithms that calculate streaks and behavioral trends in real-time." },
              { icon: Shield, title: "Privacy First", desc: "All system telemetry is cryptographically secured. Your rituals are your own." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all"
              >
                 <div className="p-4 bg-white/5 rounded-2xl mb-8 group-hover:bg-primary/10 transition-colors">
                    <f.icon className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                 </div>
                 <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                 <p className="text-muted leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
         </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-20 px-8 max-w-7xl mx-auto border-t border-white/5 text-center">
         <div className="flex flex-col items-center gap-10">
            <h3 className="text-3xl font-bold tracking-tight">Ready to synchronize?</h3>
            <button 
              onClick={onStart}
              className="px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-all glow-primary flex items-center gap-3"
            >
               Deploy Workspace Now
               <ArrowUpRight className="w-5 h-5" />
            </button>
            <div className="pt-20 flex items-center justify-between w-full border-t border-white/5 opacity-30">
               <span className="text-xs font-bold uppercase tracking-widest">© 2026 Habit Cadence Collective</span>
               <div className="flex gap-8">
                  <span className="text-xs font-bold uppercase cursor-pointer hover:text-white transition-all">Twitter</span>
                  <span className="text-xs font-bold uppercase cursor-pointer hover:text-white transition-all">Documentation</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
