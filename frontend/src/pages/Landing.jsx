import React, { useState, useEffect } from 'react';
import { Camera, Play, Sparkles, CheckCircle2, ChevronRight, MessageSquare, ArrowRight, ShieldCheck, Heart, Flame, Database, TrendingUp, ShieldAlert, Star } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

export default function Landing({ onStartAnalyze }) {
  // Counters state for Section 4
  const [accuracy, setAccuracy] = useState(80);
  const [foodsCount, setFoodsCount] = useState(8000);

  useEffect(() => {
    // Animate stats counter triggers on mount
    const accTimer = setInterval(() => {
      setAccuracy(prev => {
        if (prev >= 98) {
          clearInterval(accTimer);
          return 98;
        }
        return prev + 1;
      });
    }, 40);

    const foodsTimer = setInterval(() => {
      setFoodsCount(prev => {
        if (prev >= 10000) {
          clearInterval(foodsTimer);
          return 10000;
        }
        return prev + 100;
      });
    }, 15);

    return () => {
      clearInterval(accTimer);
      clearInterval(foodsTimer);
    };
  }, []);

  const features = [
    {
      title: 'AI Food Recognition',
      desc: 'Instantly identifies multiple food items, ingredients, and plate volumes in a single photograph.',
      icon: Camera,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      title: 'Calorie Estimation',
      desc: 'Calculates calories dynamically using portion estimation models calibrated for different serving weights.',
      icon: Flame,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20'
    },
    {
      title: 'Macro Tracking',
      desc: 'Tracks protein, carbs, fats, fiber, sugar, and sodium values automatically for every scanned meal.',
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Health Insights',
      desc: 'Generates color-coded health indexes and custom advice based on ingredient breakdowns.',
      icon: Heart,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Food Image',
      desc: 'Drag & drop a plate photo or use your device camera to capture the dish live.'
    },
    {
      step: '02',
      title: 'AI Detects Dishes',
      desc: 'The neural network recognizes individual food groups and outlines shapes.'
    },
    {
      step: '03',
      title: 'Nutrition Analysis',
      desc: 'The system matches items to a 500+ items database and calculates calorie weights.'
    },
    {
      step: '04',
      title: 'Health Recommendations',
      desc: 'Get a summary rating alongside clear dietary tips for meal management.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Fitness Coach',
      feedback: 'NutriVision has completely simplified diet logging for my clients. They just snap a picture of their plate and the calorie estimations are remarkably accurate.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      name: 'Rohan Sharma',
      role: 'Bodybuilder',
      feedback: 'Being able to detect multiple items like chicken and rice together is a game-changer. The portion sizer is extremely intuitive.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Nutritionist',
      feedback: 'The integration of ingredient analysis and the Open Food Facts API fallback gives this app an endless catalog. Highly recommended for daily tracking.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80'
    }
  ];

  return (
    <div className="w-full space-y-24 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      
      {/* ================= SECTION 1: HERO ================= */}
      <section className="relative py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract blur background blobs */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-accent/10 dark:bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
          
          {/* Left Column Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col justify-center">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-brand-600 dark:text-brand-400 text-xs font-bold self-center lg:self-start shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-500 animate-spin-hover" />
              <span>Next-Gen Gemini Vision AI</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Know Your Calories <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-emerald-500 to-brand-accent">
                  Instantly
                </span> with AI
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Upload any food image and receive accurate calorie estimates, nutrition breakdowns, health scores, and personalized dietary insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <button
                onClick={onStartAnalyze}
                className="w-full sm:w-auto py-4 px-8 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center group"
                id="hero-scan-btn"
              >
                <Camera className="h-5 w-5 mr-2" />
                Analyze Food
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <button
                onClick={() => {
                  document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto py-4 px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2 fill-slate-700 dark:fill-slate-300 text-transparent" />
                Watch Demo
              </button>
            </motion.div>

            {/* Quick stats check */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center space-x-6 pt-6 justify-center lg:justify-start text-xs text-slate-400 font-semibold"
            >
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                <span>Multi-Food Detection</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                <span>95% Base Accuracy</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Floating Mockup Dashboard */}
          <div className="lg:col-span-6 relative h-[420px] sm:h-[500px] w-full flex items-center justify-center">
            
            {/* 1. Base Frame: Plate Image Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative w-[280px] sm:w-[320px] aspect-square rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-950 shadow-brand-500/5"
            >
              <img
                src="/uploads/pizza-seed.jpg"
                alt="Food Plate"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {/* Frame Scanning indicator line */}
              <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-brand-500 to-brand-accent animate-scan pointer-events-none" />
            </motion.div>

            {/* 2. Floating Card A: Confidence (Top Left) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-0 sm:left-4 glass-card p-4 rounded-2xl flex items-center space-x-3 w-40 sm:w-44 z-20 hover:scale-105 transition-transform"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidence</p>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">98.4% Match</h4>
              </div>
            </motion.div>

            {/* 3. Floating Card B: Calories Gauge (Bottom Left) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-12 left-0 sm:left-8 glass-card p-4 rounded-2xl flex items-center space-x-3 w-44 sm:w-48 z-20 hover:scale-105 transition-transform"
            >
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Flame className="h-5 w-5 fill-orange-500 text-transparent" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calories</p>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">520 kcal</h4>
                <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-orange-500 h-full w-[70%]" />
                </div>
              </div>
            </motion.div>

            {/* 4. Floating Card C: Macros splits (Top Right) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="absolute top-12 right-0 sm:right-6 glass-card p-4 rounded-2xl w-44 sm:w-48 z-20 space-y-2.5 hover:scale-105 transition-transform"
            >
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Macros Detected</p>
              <div className="space-y-1.5 text-[10px] font-bold">
                <div className="flex justify-between items-center text-rose-500">
                  <span>Protein</span>
                  <span>42g</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[80%]" />
                </div>

                <div className="flex justify-between items-center text-amber-500">
                  <span>Carbs</span>
                  <span>55g</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[60%]" />
                </div>
              </div>
            </motion.div>

            {/* 5. Floating Card D: Health score circular dial (Bottom Right) */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="absolute bottom-16 right-0 sm:right-10 glass-card p-4 rounded-2xl flex items-center space-x-3 w-40 sm:w-44 z-20 hover:scale-105 transition-transform"
            >
              <div className="relative h-10 w-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path strokeWidth="3.5" strokeDasharray="85, 100" strokeLinecap="round" stroke="#10B981" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Health Index</p>
                <h4 className="font-extrabold text-sm text-emerald-500">85/100</h4>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ================= SECTION 2: FEATURES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Comprehensive Analysis Features
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            AI-driven scanning modules engineered for calorie, macronutrient, and dietary support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-6 rounded-3xl space-y-4 hover:shadow-lg transition-all border border-slate-200/40 dark:border-slate-800/80"
              >
                <div className={`p-3.5 rounded-2xl inline-block ${feat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 3: HOW IT WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Go from a simple food photograph to detailed macronutrient logs in four simple steps.
          </p>
        </div>

        {/* Timeline stepper */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative pt-4">
          {/* Horizontal line connector for desktop */}
          <div className="hidden md:block absolute left-[12%] right-[12%] top-12 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

          {steps.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 relative bg-transparent">
              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-md shadow-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-lg">
                {item.step}
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-xs mx-auto md:mx-0">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 4: AI ACCURACY & METRICS ================= */}
      <section className="bg-slate-900 dark:bg-slate-950 py-16 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-2">
            <h3 className="text-5xl font-black text-brand-500 tracking-tight">{accuracy}%+</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Scan Accuracy</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">High-precision model trained on culinary structures.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-5xl font-black text-brand-accent tracking-tight">{foodsCount.toLocaleString()}+</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Foods Supported</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Extensive local catalog synced with Open Food Facts.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-5xl font-black text-emerald-400 tracking-tight">&lt; 1.5s</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Instant Analysis</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Fast cloud/local inference keeps responses quick.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-5xl font-black text-blue-400 tracking-tight">Multi-Food</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Plate Splitting</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Identify proteins, grains, and salads simultaneously.</p>
          </div>

        </div>
      </section>

      {/* ================= SECTION 5: DASHBOARD PREVIEW ================= */}
      <section id="demo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Interactive Dashboard Mockup
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Monitor nutritional metrics, history logs, and macro intake ratios in a modern portal.
          </p>
        </div>

        {/* Dashboard Preview Image frame */}
        <div className="relative w-full rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center p-2 sm:p-4 group">
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview Mockup"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            What Our Community Says
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Loved by trainers, bodybuilders, and everyday people looking to manage their health goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-6 border border-slate-200/30 dark:border-slate-800/80">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed font-medium">
                "{test.feedback}"
              </p>
              <div className="flex items-center space-x-3">
                <img
                  src={test.avatarUrl}
                  alt={test.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200/50 dark:border-slate-800"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">{test.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{test.role}</p>
                  <div className="flex items-center space-x-0.5 mt-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 7: CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-tr from-brand-600 via-emerald-600 to-brand-accent rounded-[36px] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl shadow-brand-500/10">
          {/* Decorative circle */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full -mr-10 -mt-10" />
          
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Tracking Smarter Today
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
              No manual logging, no guessing weights. Just snap a picture of your dish and let Gemini Vision AI handle the rest.
            </p>
            <button
              onClick={onStartAnalyze}
              className="mx-auto py-4 px-8 bg-white hover:bg-slate-50 text-slate-950 font-extrabold rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center group text-sm"
              id="cta-scan-btn"
            >
              <Camera className="h-4 w-4 mr-2 text-brand-600" />
              Analyze Food Now
              <ChevronRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
