import { motion } from "framer-motion";

interface StatBlockProps {
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}

export const StatBlock = ({ label, value, sub, delay = 0 }: StatBlockProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "circOut" }}
    className="relative p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center group transition-colors hover:bg-white/[0.04] hover:border-white/10"
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-sm group-hover:via-emerald-500/40 transition-all duration-700" />
    
    <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-4 pointer-events-none px-4 py-1.5 rounded-full border border-white/5 bg-black/40">
      {label}
    </span>
    
    <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
      {value}
    </span>
    
    {sub && (
      <span className="text-[10px] text-emerald-500/80 font-bold mt-4 uppercase tracking-[0.1em] px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
        {sub}
      </span>
    )}
  </motion.div>
);
