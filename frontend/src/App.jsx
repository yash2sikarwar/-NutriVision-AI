import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Scanner from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import useDarkMode from './hooks/useDarkMode';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [theme, toggleTheme] = useDarkMode();
  const [scanResult, setScanResult] = useState(null);
  const [baseNutrition, setBaseNutrition] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger custom animated error notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    // Auto clear after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* 1. Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto-clear active scan when swapping tabs
          if (tab !== 'scanner') {
            setScanResult(null);
            setBaseNutrition(null);
          }
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 2. Main Page Render */}
      <main className="flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (scanResult ? '-results' : '-input')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {activeTab === 'landing' && (
              <Landing onStartAnalyze={() => setActiveTab('scanner')} />
            )}

            {activeTab === 'scanner' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Visual Header copy */}
                {!scanResult && (
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">AI Food Scanner</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Place your food in the frame or upload an existing file to run the AI neural classification.
                    </p>
                  </div>
                )}

                {scanResult ? (
                  <ResultsDisplay
                    scanData={scanResult}
                    baseNutrition={baseNutrition}
                    onBack={() => {
                      setScanResult(null);
                      setBaseNutrition(null);
                    }}
                    onSaveSuccess={() => {
                      setScanResult(null);
                      setBaseNutrition(null);
                      setActiveTab('dashboard');
                    }}
                  />
                ) : (
                  <Scanner
                    onUploadStart={() => {}}
                    onUploadSuccess={(data, baseNut) => {
                      setScanResult(data);
                      setBaseNutrition(baseNut);
                    }}
                    onUploadError={(err) => triggerToast(err)}
                  />
                )}
              </div>
            )}

            {activeTab === 'dashboard' && <Dashboard />}

            {activeTab === 'about' && <About />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Global Toast Notifications Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center bg-rose-600 border border-rose-500 text-white rounded-2xl py-4 px-5 shadow-2xl space-x-3 w-[340px] max-w-[calc(100vw-3rem)]"
          >
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 text-xs font-semibold leading-normal">{toastMessage}</div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Elegant Footer */}
      <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/60 py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 NutriVision AI. Made for hackathons, MVPs, and smart nutrition tracking.</p>
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('about')} className="hover:underline">AI Docs</button>
            <span>•</span>
            <button onClick={() => setActiveTab('scanner')} className="hover:underline">Scanner</button>
            <span>•</span>
            <button onClick={() => setActiveTab('dashboard')} className="hover:underline">Dashboard</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
