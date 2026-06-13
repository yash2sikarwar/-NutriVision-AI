import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, Save, PlusCircle, Scale, ShieldAlert, Award, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function ResultsDisplay({ scanData, baseNutrition, onBack, onSaveSuccess }) {
  const [portion, setPortion] = useState('Medium');
  const [nutrients, setNutrients] = useState({
    calories: scanData.calories,
    macros: scanData.macros,
    estimatedWeight: scanData.estimatedWeight
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);

  const isNotFood = scanData.notFood === true;
  const isLowConfidence = scanData.confidence < 60 && !isNotFood;

  // 1. Recalculate nutrients when portion size changes (only for high confidence)
  useEffect(() => {
    if (isLowConfidence || !baseNutrition) return;

    // baseNutrition is an array of sub-foods detected on the plate
    let scaleFactor = 1.0;
    if (portion === 'Small') scaleFactor = 0.6;
    if (portion === 'Large') scaleFactor = 1.5;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalWeight = 0;

    baseNutrition.forEach(item => {
      const baseNut = item.nutrition;
      
      // Load specific food serving weights from database, or fall back to factor multiplier
      let itemWeight = baseNut.portionSizes?.[portion];
      if (!itemWeight) {
        itemWeight = Math.round(item.estimated_weight_g * scaleFactor);
      }

      const multiplier = itemWeight / 100;
      
      totalCalories += Math.round(baseNut.calories_per_100g * multiplier);
      totalProtein += (baseNut.protein * multiplier);
      totalCarbs += (baseNut.carbs * multiplier);
      totalFat += (baseNut.fat * multiplier);
      totalFiber += (baseNut.fiber * multiplier);
      totalSugar += (baseNut.sugar * multiplier);
      totalSodium += Math.round(baseNut.sodium * multiplier);
      totalWeight += itemWeight;
    });

    setNutrients({
      calories: totalCalories,
      estimatedWeight: totalWeight,
      macros: {
        protein: parseFloat(totalProtein.toFixed(1)),
        carbs: parseFloat(totalCarbs.toFixed(1)),
        fat: parseFloat(totalFat.toFixed(1)),
        fiber: parseFloat(totalFiber.toFixed(1)),
        sugar: parseFloat(totalSugar.toFixed(1)),
        sodium: Math.round(totalSodium)
      }
    });

  }, [portion, baseNutrition, isLowConfidence]);

  // 2. Save portion updates
  const handleConfirmSave = async () => {
    if (isLowConfidence || isNotFood) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/food/history/${scanData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portionSize: portion
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSaveCompleted(true);
        setTimeout(() => {
          onSaveSuccess();
        }, 1000);
      } else {
        onSaveSuccess();
      }
    } catch (err) {
      console.error(err);
      onSaveSuccess();
    } finally {
      setIsUpdating(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 70) return { text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-50 dark:bg-emerald-950/20', fill: '#10B981' };
    if (score >= 40) return { text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-50 dark:bg-amber-950/20', fill: '#F59E0B' };
    return { text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-50 dark:bg-rose-950/20', fill: '#EF4444' };
  };

  const scoreTheme = getHealthScoreColor(scanData.healthScore);

  // 3. Nutrition Comparison data (current meal vs recommended daily targets)
  // Targets: Protein 80g, Carbs 250g, Fat 65g
  const comparisonData = [
    { name: 'Protein', Meal: nutrients.macros.protein, Target: 80 },
    { name: 'Carbohydrates', Meal: nutrients.macros.carbs, Target: 250 },
    { name: 'Fats', Meal: nutrients.macros.fat, Target: 65 }
  ];

  // 4. Plate Sizing Visual details
  const getPlateScale = () => {
    if (portion === 'Small') return { scale: 0.55, text: 'Small Portion (~25% Coverage)' };
    if (portion === 'Large') return { scale: 0.95, text: 'Large Portion (~85% Coverage)' };
    return { scale: 0.75, text: 'Medium Portion (~55% Coverage)' };
  };
  const plateDetails = getPlateScale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Header back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Analyzer
        </button>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          Scan ID: {scanData._id}
        </span>
      </div>

      {/* ================= CASE A: LOW CONFIDENCE WARNING ================= */}
      {isLowConfidence && (
        <div className="flex items-start p-6 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900/50 rounded-3xl text-rose-800 dark:text-rose-400 space-x-4">
          <ShieldAlert className="h-8 w-8 text-rose-500 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-lg">Food Could Not Be Identified Accurately</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              The neural networks returned a classification confidence score of **{scanData.confidence}%**, which is below our safety limit threshold (60%). 
              We have blocked nutrition logging to prevent recording incorrect calories.
            </p>
            <div className="bg-white/40 dark:bg-slate-950/40 p-4 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 text-xs mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p className="font-bold uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">Confidence Explanation:</p>
              <p className="italic">"{scanData.confidenceExplanation || 'The shapes and colors do not match any recognized food profile.'}"</p>
            </div>
            
            <div className="pt-2">
              <button
                onClick={onBack}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Try Another Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CASE B: NON-FOOD WARNING ================= */}
      {isNotFood && (
        <div className="flex items-start p-6 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900/50 rounded-3xl text-amber-800 dark:text-amber-400 space-x-4 animate-fadeIn">
          <ShieldAlert className="h-8 w-8 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-lg text-amber-900 dark:text-amber-200">Non-Food Image Detected</h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-bold">
              This image does not appear to contain food. Please upload a food image.
            </p>
            <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-400">
              The AI analyzer evaluated this image with a food probability of **{scanData.confidence}%**, which falls below our minimum food threshold (70%).
              We have blocked database logging for this scan.
            </p>
            <div className="bg-white/40 dark:bg-slate-950/40 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-xs mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">Rejection Details:</p>
              <p className="italic">"{scanData.confidenceExplanation || 'The uploaded image resembles a non-edible object or office electronics.'}"</p>
            </div>
            
            <div className="pt-2">
              <button
                onClick={onBack}
                className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Upload Food Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image, Ingredients, Plate Visual */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* image container */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-square">
            <img
              src={scanData.imageUrl}
              alt="Uploaded Food"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/70 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scanned Item</p>
                <h4 className="text-white font-bold text-base truncate max-w-[180px]">{scanData.foodName}</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold">Confidence</p>
                <span className={`font-extrabold text-base ${isLowConfidence ? 'text-rose-400 animate-pulse' : 'text-brand-400'}`}>
                  {scanData.confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* 1. Visual Serving Sizer Indicator (circular SVG) */}
          {!isLowConfidence && !isNotFood && (
            <div className="glass-card rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center">
                <Scale className="h-4 w-4 mr-2 text-brand-500" />
                Plate Sizing Visual
              </h4>
              
              <div className="flex items-center space-x-6">
                {/* SVG Plate design */}
                <div className="relative h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300/40 dark:border-slate-800 flex items-center justify-center shadow-inner">
                  {/* Plate rim */}
                  <div className="h-20 w-20 rounded-full border border-slate-300/20 dark:border-slate-800/80 flex items-center justify-center">
                    {/* Food circle area */}
                    <motion.div
                      animate={{ scale: plateDetails.scale }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="h-16 w-16 rounded-full bg-brand-500/20 border-2 border-brand-500/80 flex items-center justify-center text-brand-700 dark:text-brand-400 text-[10px] font-black"
                    >
                      Food
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{plateDetails.text}</p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Estimated area calculated relative to typical dinner plate sizes (26cm diameter).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Ingredients Tag List */}
          {!isNotFood && scanData.ingredients && scanData.ingredients.length > 0 && (
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Detected Ingredients
              </h4>
              <div className="flex flex-wrap gap-2">
                {scanData.ingredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Calculations & Comparison Charts */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* If High Confidence */}
          {!isLowConfidence && !isNotFood ? (
            <>
              {/* Calories & Health Score gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Calories Card */}
                <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-full pointer-events-none" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plate Calories</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                      {nutrients.calories} <span className="text-sm font-bold text-slate-400">kcal</span>
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    Portion: {portion} ({nutrients.estimatedWeight}g total weight)
                  </p>
                </div>

                {/* Health Index Card */}
                <div className={`glass-card rounded-3xl p-6 flex items-center justify-between border ${scoreTheme.border} ${scoreTheme.bg}`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plate Health Index</span>
                    <div className="flex items-baseline space-x-0.5">
                      <span className={`text-3xl font-black ${scoreTheme.text}`}>{scanData.healthScore}</span>
                      <span className="text-slate-400 font-semibold text-xs">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {scanData.healthScore >= 70 ? 'Excellent nutrition choice' : scanData.healthScore >= 40 ? 'Moderate density' : 'High saturated fats/sugar'}
                    </p>
                  </div>

                  <div className="relative h-14 w-14">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path strokeWidth="3.5" strokeDasharray={`${scanData.healthScore}, 100`} strokeLinecap="round" stroke={scoreTheme.fill} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Award className={`h-5 w-5 ${scoreTheme.text}`} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Portion selector */}
              <div className="glass-card rounded-3xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Portion Sizer:</span>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  {['Small', 'Medium', 'Large'].map(size => (
                    <button
                      key={size}
                      onClick={() => setPortion(size)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        portion === size
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Macros values details */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Nutritional Breakdown
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Protein</div>
                    <div className="font-extrabold text-rose-500 text-base mt-1">{nutrients.macros.protein}g</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Carbohydrates</div>
                    <div className="font-extrabold text-amber-500 text-base mt-1">{nutrients.macros.carbs}g</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Fats</div>
                    <div className="font-extrabold text-indigo-500 text-base mt-1">{nutrients.macros.fat}g</div>
                  </div>
                </div>

                {/* Micro nutrition rows */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                  <div><span className="text-slate-400">Fiber:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{nutrients.macros.fiber}g</span></div>
                  <div><span className="text-slate-400">Sugar:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{nutrients.macros.sugar}g</span></div>
                  <div><span className="text-slate-400">Sodium:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{nutrients.macros.sodium}mg</span></div>
                </div>
              </div>

              {/* 3. Nutrition Comparison chart (Recharts) */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Daily Intake Guideline Comparison
                </h4>
                <div className="h-44 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Meal" fill="#22C55E" radius={[4, 4, 0, 0]} name="This Plate" />
                      <Bar dataKey="Target" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Daily Recommended Target" className="dark:fill-slate-800" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            /* Low confidence or Non-food fallback: large instructions panel */
            <div className={`glass-card rounded-3xl p-6 space-y-4 border ${isNotFood ? 'border-amber-200/50' : 'border-rose-200/50'}`}>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center">
                <Info className={`h-4 w-4 mr-2 ${isNotFood ? 'text-amber-500' : 'text-rose-500'}`} />
                Scan Diagnostics Details
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {isNotFood
                  ? "The image was rejected because it does not match culinary features and is classified as a non-food item."
                  : "The image upload could not be mapped to any recognized items in our 500+ items catalog or Open Food Facts registers."}
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold ${isNotFood ? 'text-amber-500' : 'text-rose-500'}`}>
                    {isNotFood ? 'Rejected (Non-Food)' : 'Low Confidence'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Food Probability:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{scanData.confidence}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Reasoning:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {isNotFood ? 'Below 70% food threshold' : 'Confidence limits exceeded'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Top 3 predictions & Confidence Explanations */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
              AI Classifier Details
            </h4>
            
            {/* Predictions List */}
            {scanData.topPredictions && scanData.topPredictions.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Predictions</p>
                {scanData.topPredictions.map((pred, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{pred.name}</span>
                      <span className="text-slate-400">{pred.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. "Why this prediction?" Section */}
            {scanData.whyPrediction && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Why this prediction?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  "{scanData.whyPrediction}"
                </p>
              </div>
            )}

            {/* Confidence explanation details */}
            {scanData.confidenceExplanation && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Image Quality & Focus</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {scanData.confidenceExplanation}
                </p>
              </div>
            )}

          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            {!isLowConfidence && !isNotFood && (
              <button
                onClick={handleConfirmSave}
                disabled={isUpdating || saveCompleted}
                className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all ${
                  saveCompleted
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 active:scale-[0.99] hover:shadow-brand-600/30'
                } disabled:opacity-50`}
              >
                {isUpdating ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving update...
                  </>
                ) : saveCompleted ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Saved to Dashboard!
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Confirm & Save to Dashboard
                  </>
                )}
              </button>
            )}

            <button
              onClick={onBack}
              className={`py-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 transition-colors inline-flex items-center ${(isLowConfidence || isNotFood) ? 'flex-1 justify-center' : ''}`}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Analyze Another
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
