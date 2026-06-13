import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import HistoryList from '../components/HistoryList';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setError(null);
    try {
      // Fetch stats and history concurrently
      const [historyRes, statsRes] = await Promise.all([
        fetch('/api/food/history'),
        fetch('/api/food/stats')
      ]);

      if (!historyRes.ok || !statsRes.ok) {
        throw new Error('Failed to retrieve dashboard records.');
      }

      const historyData = await historyRes.json();
      const statsData = await statsRes.json();

      if (historyData.success && statsData.success) {
        setHistory(historyData.data);
        setStats(statsData.data);
      } else {
        throw new Error('Error processing history formats.');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Could not establish server connection. Ensure the Express backend is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle item deletion
  const handleDeleteLog = async (id) => {
    try {
      const response = await fetch(`/api/food/history/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Optimistically filter item out of local state
        setHistory(prev => prev.filter(item => item._id !== id));
        
        // Refresh statistics to reflect the deletion
        const statsRes = await fetch('/api/food/stats');
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      } else {
        console.error('Delete error:', result.message);
      }
    } catch (err) {
      console.error('Network error deleting history item:', err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center">
            <LayoutDashboard className="h-7 w-7 text-brand-500 mr-3" />
            Nutritional Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Monitor your calorie goals, macronutrient splits, and previous scans in one portal.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="self-start sm:self-center py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm transition-colors flex items-center"
          id="refresh-dashboard-btn"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* 2. Error Display */}
      {error && (
        <div className="flex items-start bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-rose-800 dark:text-rose-400 text-sm">
          <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 text-rose-500" />
          <div>
            <span className="font-bold">Database Error:</span> {error}
            <button
              onClick={fetchDashboardData}
              className="block mt-2 font-bold text-xs underline text-rose-600 dark:text-rose-300"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* 3. Metrics Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            Dietary Metrics & Trends
          </h2>
        </div>
        <AnalyticsDashboard statsData={stats} />
      </div>

      {/* 4. History Log Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <History className="h-5 w-5 text-brand-500 mr-2" />
            Previous Food Scans
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review, filter, and manage all your processed plates.</p>
        </div>
        <HistoryList history={history} onDelete={handleDeleteLog} isLoading={loading} />
      </div>

    </div>
  );
}
