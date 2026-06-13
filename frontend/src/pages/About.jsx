import React from 'react';
import { ShieldCheck, Cpu, HardDrive, HelpCircle, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  
  const techStack = [
    { name: 'React.js + Vite', role: 'Frontend Core & Dev Server', category: 'Frontend' },
    { name: 'Tailwind CSS', role: 'Utility styling & layouts', category: 'Frontend' },
    { name: 'Framer Motion', role: 'Micro-animations & transitions', category: 'Frontend' },
    { name: 'Recharts', role: 'Interactive history graphs', category: 'Frontend' },
    { name: 'Node.js + Express.js', role: 'Backend API processing', category: 'Backend' },
    { name: 'TensorFlow.js', role: 'Image feature classification', category: 'AI/ML' },
    { name: 'MongoDB + Mongoose', role: 'History logs storage', category: 'Database' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. Header Banners */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white">
          About NutriVision<span className="text-brand-500">AI</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Understand the engineering, machine learning pipelines, and database layers backing the calorie estimator.
        </p>
      </div>

      {/* 2. core sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* ML model card */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-brand-500">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">How the AI Recognition Works</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            When you capture or upload a meal image, the backend decodes the pixels into raw RGB matrices in memory. 
            It feeds them to a pre-trained **MobileNet V2** neural network running on **TensorFlow.js**. 
            The model computes high-level feature vectors and outputs classification probabilities. 
            We map these ImageNet food classes to our curated nutrition database to load baseline nutrients per 100g.
          </p>
        </div>

        {/* Dynamic portion sizing card */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
            <HardDrive className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Dynamic Sizing & Database</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Our nutrition library maps baseline macros (protein, fat, carbs, sugar, fiber, sodium) per 100g. 
            When you choose **Small, Medium, or Large** on the Results display, the UI scales the gram multipliers 
            and recalculates calorie values in real time. 
            Any updates are synced to **MongoDB** via a `PUT` router to keep history dashboards up to date.
          </p>
        </div>

      </div>

      {/* 3. Tech Stack Specs */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Technical Architecture Specifications</h3>
          <p className="text-xs text-slate-400 mt-1">Below is the complete developer stack integrated into the NutriVision MVP.</p>
        </div>

        <div className="border border-slate-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white/30 dark:bg-slate-950/20">
          <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900/40 p-4 border-b border-slate-200/50 dark:border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400">
            <div>Component</div>
            <div>Description</div>
            <div className="text-right">Tier</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {techStack.map((tech) => (
              <div key={tech.name} className="grid grid-cols-3 p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 items-center">
                <div className="text-slate-800 dark:text-white font-bold">{tech.name}</div>
                <div>{tech.role}</div>
                <div className="text-right">
                  <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {tech.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. FAQ section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
          <HelpCircle className="h-5 w-5 text-brand-500 mr-2" />
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="pt-4 first:pt-0 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Can I run this without installing MongoDB?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              **Yes.** The Express server features an intelligent database connection check. If local MongoDB is not found, 
              the server initiates a mock database seeder in memory. All scans, deletes, and dashboard charts remain fully operational.
            </p>
          </div>
          
          <div className="pt-4 space-y-1.5">
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Does it run in offline environments?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              **Yes.** While the main AI tries to fetch MobileNet weights from a Google CDN for authentic classification, 
              if the connection is blocked or times out, the backend triggers an intelligent filename keyword and content hash classifier, 
              ensuring instant responses with beautiful nutrition profiles for demo purposes.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
