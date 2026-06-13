import React from 'react';
import { Flame, Activity, Heart, Scale, Carrot } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsDashboard({ statsData }) {
  if (!statsData || !statsData.summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        ))}
      </div>
    );
  }

  const { summary, dailyCalories, macroTrends, categoryDistribution } = statsData;

  // Stat Card Configs
  const statCards = [
    {
      title: 'Total Scans',
      value: `${summary.totalScans} meals`,
      description: 'Logged in history',
      icon: Activity,
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Average Calories',
      value: `${summary.avgCalories} kcal`,
      description: 'Per logged meal',
      icon: Flame,
      gradient: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-500'
    },
    {
      title: 'Health Index',
      value: `${summary.avgHealthScore}/100`,
      description: 'Average diet score',
      icon: Heart,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      title: 'Weight Tracked',
      value: `${(summary.totalWeight / 1000).toFixed(2)} kg`,
      description: 'Total estimated portion',
      icon: Scale,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-500'
    }
  ];

  // Palette colors for Pie Chart
  const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];

  return (
    <div className="space-y-6">
      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-card rounded-3xl p-6 flex items-center justify-between relative overflow-hidden bg-gradient-to-tr ${card.gradient}`}
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {card.title}
                </span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  {card.value}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
              <div className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm ${card.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Calorie Consumption (Bar Chart) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Daily Calorie Consumption</h3>
            <p className="text-xs text-slate-400 mt-1">Calorie totals logged over the past 7 days.</p>
          </div>
          <div className="h-72 w-full mt-6">
            {dailyCalories.reduce((a, b) => a + b.calories, 0) === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Carrot className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm">No calories logged in the last 7 days.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCalories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" className="hidden dark:block" />
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: 'rgba(76, 175, 80, 0.05)' }}
                  />
                  <Bar dataKey="calories" fill="#4CAF50" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Food Categories (Pie Chart) */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Category Distribution</h3>
            <p className="text-xs text-slate-400 mt-1">Distribution of your scans across meal groups.</p>
          </div>
          
          <div className="h-56 w-full mt-6 relative flex items-center justify-center">
            {categoryDistribution.length === 0 ? (
              <div className="text-center text-slate-400">
                <p className="text-sm">No categories mapped yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center Summary Label */}
            {categoryDistribution.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Categories</span>
                <span className="text-2xl font-black text-slate-700 dark:text-white mt-0.5">
                  {categoryDistribution.length}
                </span>
              </div>
            )}
          </div>

          {/* Pie Legend List */}
          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
            {categoryDistribution.slice(0, 4).map((entry, idx) => (
              <div key={entry.name} className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate max-w-[80px]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Wide: Macro Intake Progressions (Area Chart) */}
        <div className="lg:col-span-12 glass-card rounded-3xl p-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Macro Nutrient Intake Trends</h3>
            <p className="text-xs text-slate-400 mt-1">Gram levels of Protein, Carbs, and Fats across your last 7 scans.</p>
          </div>
          <div className="h-64 w-full mt-6">
            {macroTrends.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm">Scan foods to populate nutrient timeline progression.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={macroTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" className="hidden dark:block" />
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  
                  {/* Carbs Area */}
                  <Area
                    type="monotone"
                    dataKey="carbs"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="rgba(245, 158, 11, 0.15)"
                    strokeWidth={2}
                  />
                  {/* Protein Area */}
                  <Area
                    type="monotone"
                    dataKey="protein"
                    stackId="1"
                    stroke="#F43F5E"
                    fill="rgba(244, 63, 94, 0.15)"
                    strokeWidth={2}
                  />
                  {/* Fat Area */}
                  <Area
                    type="monotone"
                    dataKey="fat"
                    stackId="1"
                    stroke="#6366F1"
                    fill="rgba(99, 102, 241, 0.15)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
