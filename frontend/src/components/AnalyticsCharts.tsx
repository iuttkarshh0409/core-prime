import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Loader2, Activity, Calendar } from "lucide-react";
import { useState } from "react";

export const CompletionTrendChart = () => {
  const [days, setDays] = useState(30);
  
  const { data: trends, isLoading } = useQuery({
    queryKey: ["analytics", "trends", days],
    queryFn: async () => (await api.get(`/analytics/trends?days=${days}`)).data,
  });

  const chartData = trends?.map((t: any) => ({
    date: t.date.split("-").slice(1).join("/"), // MM/DD
    rate: Math.round((t.completed / t.total) * 100),
  }));

  const periods = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
         <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-500/10 rounded-[1.5rem] border border-purple-500/20 shadow-glow">
               <Activity className="w-8 h-8 text-purple-500" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none italic">Velocity Spectrum</h3>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Global Performance Fluctuations</p>
            </div>
         </div>

         {/* RANGE SELECTOR */}
         <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => setDays(p.value)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${
                        days === p.value 
                        ? "bg-white text-black shadow-lg scale-105" 
                        : "text-gray-500 hover:text-white"
                    }`}
                >
                    {p.label}
                </button>
            ))}
         </div>
      </div>

      <div className="h-[350px] w-full relative">
        {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#4b5563" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={15}
              fontFamily="inherit"
              fontWeight={900}
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val}%`}
              fontFamily="inherit"
              fontWeight={900}
            />
            <Tooltip 
              cursor={{ stroke: '#A855F7', strokeWidth: 1, strokeDasharray: '5 5' }}
              contentStyle={{ 
                backgroundColor: "#080808", 
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                padding: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
              }}
            />
            <Area 
               type="monotone" 
               dataKey="rate" 
               stroke="#A855F7" 
               strokeWidth={4}
               fillOpacity={1} 
               fill="url(#colorRate)" 
               animationDuration={1500}
               strokeLinecap="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// HEATMAP SIMULATION
export const BiometricHeatmap = () => {
    const days = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      active: Math.random() > 0.3
    }));

    return (
        <div className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl h-full flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-4 mb-10">
                 <Calendar className="w-6 h-6 text-emerald-500" />
                 <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Monthly Density</h3>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                 {days.map((d, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.01 }}
                     className={`aspect-square rounded-xl border transition-all duration-700 ${
                       d.active 
                         ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                         : "bg-white/5 border-white/5"
                     }`}
                   />
                 ))}
              </div>
           </div>
           <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">
              <span>Epoch Start</span>
              <span>Epoch End</span>
           </div>
        </div>
    )
}
