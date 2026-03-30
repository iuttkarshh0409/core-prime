import { 
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
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
  ];

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
               <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white tracking-tight leading-none italic">Habit Performance</h3>
               <p className="text-[10px] text-muted font-medium mt-1">Percentage completion across active habits.</p>
            </div>
         </div>

         <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => setDays(p.value)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all duration-300 ${
                        days === p.value 
                        ? "bg-white text-black shadow-lg scale-105" 
                        : "text-muted hover:text-white"
                    }`}
                >
                    {p.label}
                </button>
            ))}
         </div>
      </div>

      <div className="h-[280px] w-full relative">
        {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={15}
              fontWeight={700}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val}%`}
              fontWeight={700}
            />
            <Tooltip 
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ 
                backgroundColor: "#0a0a0a", 
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                fontSize: "12px",
                fontWeight: "700"
              }}
              itemStyle={{ color: "hsl(var(--primary))" }}
            />
            <Area 
               type="monotone" 
               dataKey="rate" 
               stroke="hsl(var(--primary))" 
               strokeWidth={3}
               fillOpacity={1} 
               fill="url(#colorRate)" 
               animationDuration={1500}
               strokeLinecap="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const BiometricHeatmap = () => {
    const days = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      active: Math.random() > 0.4
    }));

    return (
        <div className="w-full flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <Calendar className="w-5 h-5 text-accent" />
                 <h3 className="text-lg font-bold text-white tracking-tight">Consistency View</h3>
              </div>
              <div className="grid grid-cols-6 gap-2.5">
                 {days.map((d, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.01 }}
                     className={`aspect-square rounded-lg border transition-all duration-700 ${
                       d.active 
                         ? "bg-accent/20 border-accent/40" 
                         : "bg-white/5 border-white/5"
                     }`}
                     title={`Activity day ${d.day}`}
                   />
                 ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-muted uppercase tracking-[0.4em]">
               <span>Day 01</span>
               <span>Day 30</span>
            </div>
        </div>
    )
}
