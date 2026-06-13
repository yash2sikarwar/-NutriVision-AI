import React, { useState } from 'react';
import { Search, Calendar, Flame, Trash2, ArrowUpDown, ShieldAlert, Award, Inbox, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryList({ history, onDelete, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, calories-desc, calories-asc, health-desc

  // 1. Gather all unique food categories in current history
  const categories = ['All', ...new Set(history.map(item => item.category || 'Other').filter(Boolean))];

  // 2. Run filtering
  const filteredHistory = history.filter((item) => {
    // Search match
    const matchesSearch = item.foodName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category match
    const category = item.category || 'Other';
    const matchesCategory = categoryFilter === 'All' || category === categoryFilter;

    // Health Rating match
    let rating = 'Unhealthy';
    if (item.healthScore >= 70) rating = 'Healthy';
    else if (item.healthScore >= 40) rating = 'Moderate';

    const matchesHealth = healthFilter === 'All' || rating === healthFilter;

    return matchesSearch && matchesCategory && matchesHealth;
  });

  // 3. Run sorting
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'calories-desc') return b.calories - a.calories;
    if (sortBy === 'calories-asc') return a.calories - b.calories;
    if (sortBy === 'health-desc') return b.healthScore - a.healthScore;
    return 0;
  });

  // Helper for health score colors
  const getHealthTagStyles = (score) => {
    if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
  };

  return (
    <div className="space-y-6">
      
      {/* Search, Category, Health Filters Panel */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Text Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search food scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800 dark:text-white"
              id="search-input"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-700 dark:text-slate-300"
              id="category-filter"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Health Index Filter */}
          <div className="md:col-span-3">
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-700 dark:text-slate-300"
              id="health-filter"
            >
              <option value="All">All Health Ratings</option>
              <option value="Healthy">Healthy (70-100)</option>
              <option value="Moderate">Moderate (40-69)</option>
              <option value="Unhealthy">Unhealthy (0-39)</option>
            </select>
          </div>

          {/* Sorter Selector */}
          <div className="md:col-span-2 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-700 dark:text-slate-300 appearance-none"
              id="sorting-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="calories-desc">Calories: High to Low</option>
              <option value="calories-asc">Calories: Low to High</option>
              <option value="health-desc">Health Score</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* History Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : sortedHistory.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
            <Inbox className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">No Food Records Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery || categoryFilter !== 'All' || healthFilter !== 'All'
                ? 'Try tweaking your filters or search terms.'
                : 'Scanned meals will show up here. Capture your first plate to start!'}
            </p>
          </div>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedHistory.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300"
              >
                {/* Visual Image container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80">
                  <img
                    src={item.imageUrl}
                    alt={item.foodName}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Calorie Tag Overlay */}
                  <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-extrabold flex items-center shadow-md">
                    <Flame className="h-3.5 w-3.5 text-orange-500 mr-1 fill-orange-500" />
                    {item.calories} kcal
                  </div>

                  {/* Portion tag overlay */}
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/30">
                    {item.portionSize} ({item.estimatedWeight}g)
                  </div>
                </div>

                {/* Card details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {item.category || 'Other'}
                      </span>
                      {/* Health score tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md ${getHealthTagStyles(item.healthScore)}`}>
                        Score: {item.healthScore}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight truncate">
                      {item.foodName}
                    </h4>
                  </div>

                  {/* Macros Strip */}
                  <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-2xl text-[10px] border border-slate-100 dark:border-slate-900/50">
                    <div>
                      <div className="text-slate-400">Protein</div>
                      <div className="font-bold text-rose-500 mt-0.5">{item.macros.protein}g</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Carbs</div>
                      <div className="font-bold text-amber-500 mt-0.5">{item.macros.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Fats</div>
                      <div className="font-bold text-indigo-500 mt-0.5">{item.macros.fat}g</div>
                    </div>
                  </div>

                  {/* Footer layout */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-300" />
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    {/* Delete Trigger */}
                    <button
                      onClick={() => onDelete(item._id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="Delete log"
                      id={`delete-btn-${item._id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}
