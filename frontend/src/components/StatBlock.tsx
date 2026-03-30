import { motion } from "framer-motion";

interface StatBlockProps {
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}

export const StatBlock = ({ label, value, sub, delay = 0 }: StatBlockProps) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.8, type: "spring", stiffness: 100 }}
    className="relative p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col items-start gap-1 group transition-all hover:bg-white/[0.05] hover:border-primary/20 overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
    
    <span className="text-[10px] font-bold tracking-widest text-muted uppercase">
      {label}
    </span>
    
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white tabular-nums tracking-tighter">
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-accent font-bold uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
          {sub}
        </span>
      )}
    </div>

    {/* Soft Glow */}
    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all duration-700" />
  </motion.div>
);
