const ScanHistory = require('../models/scanHistory');
const aiService = require('../services/aiService');
const fs = require('fs');
const path = require('path');

// In-Memory Database Fallback
let inMemoryHistory = [];

/**
 * Helper to format a date into a short day-name string (e.g. 'Mon')
 */
const getDayLabel = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Helper to aggregate statistics from history arrays
 */
const aggregateStats = (scans) => {
  const totalScans = scans.length;
  const totalCalories = scans.reduce((sum, item) => sum + item.calories, 0);
  const avgCalories = totalScans ? Math.round(totalCalories / totalScans) : 0;
  const avgHealthScore = totalScans ? Math.round(scans.reduce((sum, item) => sum + item.healthScore, 0) / totalScans) : 0;
  const totalWeight = scans.reduce((sum, item) => sum + item.estimatedWeight, 0);

  const dailyCalories = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const label = getDayLabel(d);
    
    const dailySum = scans
      .filter((scan) => {
        const scanDate = new Date(scan.createdAt);
        return scanDate.toDateString() === d.toDateString();
      })
      .reduce((sum, item) => sum + item.calories, 0);
      
    dailyCalories.push({ name: label, calories: dailySum });
  }

  const recentScans = [...scans].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-7);
  const macroTrends = recentScans.map((scan) => ({
    name: scan.foodName.length > 12 ? scan.foodName.substring(0, 10) + '..' : scan.foodName,
    protein: scan.macros.protein,
    carbs: scan.macros.carbs,
    fat: scan.macros.fat
  }));

  const categoryMap = {};
  scans.forEach((scan) => {
    // If multiple items are combined, use the primary item category or 'Mixed Meals'
    const category = scan.detectedItems && scan.detectedItems.length > 1 ? 'Mixed Meals' : (scan.detectedItems?.[0]?.nutrition?.category || 'General Foods');
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));

  return {
    summary: {
      totalScans,
      avgCalories,
      avgHealthScore,
      totalWeight
    },
    dailyCalories,
    macroTrends,
    categoryDistribution
  };
};

// Seed initial history with new upgraded format
const seedInitialData = () => {
  const seedItems = [
    {
      _id: 'mock-upgrade-1',
      foodName: 'Grilled Chicken + Plain Rice + Fresh Salad',
      confidence: 96.5,
      calories: 630,
      macros: { protein: 71.2, carbs: 48.6, fat: 12.0, fiber: 5.2, sugar: 3.5, sodium: 580 },
      portionSize: 'Medium',
      estimatedWeight: 450,
      healthScore: 88,
      recommendations: [
        "Excellent high-protein meal suitable for muscle growth and weight management.",
        "A balanced mix of lean protein, energy carbs, and high fiber greens.",
        "Add a pinch of black pepper or squeeze lemon juice to enhance flavor and mineral loading."
      ],
      imageUrl: '/uploads/biryani-seed.jpg',
      whyPrediction: "Shows a partitioned dinner plate with clear grilled chicken strips, fluffy long-grain white rice, and leafy greens.",
      ingredients: ["Chicken breast", "White rice", "Lettuce", "Olive oil", "Lemon", "Garlic", "Salt"],
      confidenceExplanation: "Highly clear visual separation of macro groups under direct lighting.",
      plateSizeEstimation: "Large plate, food covers roughly 75% of surface area.",
      topPredictions: [
        { name: "Grilled Chicken + Rice + Salad", confidence: 96.5 },
        { name: "Chicken Curry + Rice + Veggies", confidence: 72.0 },
        { name: "Tandoori Chicken + Pulao", confidence: 64.0 }
      ],
      detectedItems: [
        {
          name: "Grilled Chicken",
          confidence: 96.5,
          estimated_weight_g: 220,
          nutrition: {
            name: "Grilled Chicken",
            calories_per_100g: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            sodium: 180,
            category: "Proteins",
            portionSizes: { "Small": 120, "Medium": 220, "Large": 350 },
            recommendations: ["Excellent lean protein."]
          }
        },
        {
          name: "Plain Rice",
          confidence: 95.0,
          estimated_weight_g: 150,
          nutrition: {
            name: "Steamed White Rice",
            calories_per_100g: 130,
            protein: 2.7,
            carbs: 28.0,
            fat: 0.3,
            fiber: 0.4,
            sugar: 0.1,
            sodium: 1,
            category: "Indian Foods",
            portionSizes: { "Small": 100, "Medium": 150, "Large": 250 },
            recommendations: ["Clean energy carbohydrates."]
          }
        },
        {
          name: "Fresh Garden Salad",
          confidence: 90.0,
          estimated_weight_g: 80,
          nutrition: {
            name: "Garden Salad",
            calories_per_100g: 45,
            protein: 1.5,
            carbs: 4.8,
            fat: 2.2,
            fiber: 2.4,
            sugar: 1.8,
            sodium: 85,
            category: "Vegetables",
            portionSizes: { "Small": 50, "Medium": 80, "Large": 120 },
            recommendations: ["Antioxidant-dense leafy greens."]
          }
        }
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 'mock-upgrade-2',
      foodName: 'Classic Cheeseburger',
      confidence: 94.0,
      calories: 590,
      macros: { protein: 30.0, carbs: 55.0, fat: 28.4, fiber: 3.0, sugar: 10.4, sodium: 1220 },
      portionSize: 'Medium',
      estimatedWeight: 200,
      healthScore: 38,
      recommendations: [
        "High in saturated fats and sodium. Limit frequency of intake.",
        "Swap mayonnaise or cheese layers to cut total calorie counts.",
        "Consider drinking fresh water instead of carbonated sodas to lower sugars."
      ],
      imageUrl: '/uploads/pizza-seed.jpg',
      whyPrediction: "Shows double sesame bun with melted yellow cheese, lettuce lining, and a dark circular meat patty.",
      ingredients: ["Sesame bun", "Beef patty", "Cheddar cheese", "Mayo", "Lettuce"],
      confidenceExplanation: "Distinct round silhouette of stack burger.",
      plateSizeEstimation: "Medium plate, food covers roughly 50% of surface area.",
      topPredictions: [
        { name: "Classic Cheeseburger", confidence: 94.0 },
        { name: "Chicken Burger", confidence: 88.0 },
        { name: "Veggie Club Sandwich", confidence: 71.0 }
      ],
      detectedItems: [
        {
          name: "Classic Cheeseburger",
          confidence: 94.0,
          estimated_weight_g: 200,
          nutrition: {
            name: "Classic Cheeseburger",
            calories_per_100g: 295,
            protein: 15,
            carbs: 27.5,
            fat: 14.2,
            fiber: 1.5,
            sugar: 5.2,
            sodium: 610,
            category: "Fast Food",
            portionSizes: { "Small": 120, "Medium": 200, "Large": 320 },
            recommendations: ["High in fats."]
          }
        }
      ],
      createdAt: new Date()
    }
  ];

  inMemoryHistory = [...seedItems];
  console.log('Seeded upgraded history database (2 multi-food records).');
};

// Seed initial history
seedInitialData();

/**
 * POST /api/food/analyze
/**
 * Helper to calculate a health score dynamically based on macro/micro nutrient densities
 */
const calculateDynamicHealthScore = (nutrition) => {
  if (nutrition.healthScore !== undefined) {
    return Number(nutrition.healthScore);
  }
  
  let score = 75; // baseline

  const protein = Number(nutrition.protein || 0);
  const fiber = Number(nutrition.fiber || 0);
  const fat = Number(nutrition.fat || 0);
  const sugar = Number(nutrition.sugar || 0);
  const sodium = Number(nutrition.sodium || 0);
  const calories = Number(nutrition.calories_per_100g || nutrition.calories || 150);

  // Positive nutrient ratios
  if (protein > 15) score += 12;
  else if (protein > 8) score += 6;

  if (fiber > 3) score += 10;
  else if (fiber > 1.5) score += 5;

  // Negative nutrient ratios
  if (fat > 18) score -= 15;
  else if (fat > 10) score -= 8;

  if (sugar > 15) score -= 15;
  else if (sugar > 8) score -= 8;

  if (sodium > 450) score -= 12;
  else if (sodium > 250) score -= 6;

  if (calories > 350) score -= 10;
  else if (calories < 90) score += 5;

  return Math.min(Math.max(score, 15), 98);
};

/**
 * POST /api/food/analyze
 * Processes image, runs classification, aggregates nutrients, and saves record.
 */
exports.analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const { originalname, path: filePath, mimetype } = req.file;

    // Execute AI analyzer
    const analysis = await aiService.analyzeFoodImage(filePath, originalname, mimetype);
    const relativeImageUrl = `/uploads/${path.basename(filePath)}`;

    // 1. STAGE 1 Check: Verify if image contains food
    if (analysis.contains_food === false || analysis.food_probability < 70) {
      console.warn(`Analysis blocked: Image does not appear to contain food (probability: ${analysis.food_probability}%).`);
      
      const errorResponse = {
        success: false,
        message: 'This image does not appear to contain food. Please upload a food image.',
        notFood: true,
        data: {
          _id: 'err-' + Date.now(),
          foodName: 'Non-Food Item',
          confidence: analysis.food_probability,
          calories: 0,
          macros: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
          portionSize: 'N/A',
          estimatedWeight: 0,
          healthScore: 0,
          recommendations: [
            "Please upload an image containing actual food items.",
            "Avoid photos containing electronics, office spaces, paper documents, or packaging.",
            "Ensure the food item is clearly visible in the center of the frame."
          ],
          imageUrl: relativeImageUrl,
          whyPrediction: analysis.why_prediction,
          ingredients: [],
          confidenceExplanation: analysis.confidence_explanation,
          plateSizeEstimation: "N/A",
          topPredictions: analysis.top_predictions,
          detectedItems: [],
          notFood: true,
          food_probability: analysis.food_probability
        }
      };

      return res.status(422).json(errorResponse);
    }

    // 2. Stage 2 Check: Get primary prediction and run Confidence Threshold validation (<60%)
    const primaryItem = analysis.detected_items[0];
    const primaryConfidence = primaryItem?.confidence || 0;

    if (primaryConfidence < 60) {
      console.warn(`Analysis blocked due to low confidence threshold: ${primaryConfidence}%`);
      
      const errorResponse = {
        success: false,
        message: 'Food could not be identified accurately. Please upload a clearer image.',
        lowConfidence: true,
        data: {
          _id: 'err-' + Date.now(),
          foodName: 'Unidentified Object',
          confidence: primaryConfidence,
          calories: 0,
          macros: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
          portionSize: 'Medium',
          estimatedWeight: 0,
          healthScore: 0,
          recommendations: ["Ensure proper lighting and center the food item.", "Avoid uploads containing text, electronics, or unrelated items."],
          imageUrl: relativeImageUrl,
          whyPrediction: analysis.why_prediction,
          ingredients: analysis.ingredients,
          confidenceExplanation: analysis.confidence_explanation,
          plateSizeEstimation: analysis.plate_size_estimation,
          topPredictions: analysis.top_predictions,
          detectedItems: []
        }
      };

      return res.status(422).json(errorResponse);
    }

    // 2. Aggregate metrics for multiple detected foods
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalWeight = 0;
    let combinedName = '';
    const recommendationsSet = new Set();

    let weightedHealthScoreSum = 0;

    analysis.detected_items.forEach((item, index) => {
      const weight = item.estimated_weight_g;
      const nutrition = item.nutrition;
      const multiplier = weight / 100;

      totalCalories += Math.round(nutrition.calories_per_100g * multiplier);
      totalProtein += (nutrition.protein * multiplier);
      totalCarbs += (nutrition.carbs * multiplier);
      totalFat += (nutrition.fat * multiplier);
      totalFiber += (nutrition.fiber * multiplier);
      totalSugar += (nutrition.sugar * multiplier);
      totalSodium += Math.round(nutrition.sodium * multiplier);
      totalWeight += weight;

      // Compile recommendations
      if (nutrition.recommendations) {
        nutrition.recommendations.forEach(rec => recommendationsSet.add(rec));
      }

      // Concat names
      if (index === 0) {
        combinedName = nutrition.name;
      } else {
        combinedName += ' + ' + nutrition.name;
      }

      const itemHealthScore = calculateDynamicHealthScore(nutrition);
      weightedHealthScoreSum += (itemHealthScore * weight);
    });

    const finalHealthScore = totalWeight > 0 ? Math.round(weightedHealthScoreSum / totalWeight) : 70;

    // Create final scan record payload
    const finalRecord = {
      foodName: combinedName,
      confidence: parseFloat(primaryConfidence.toFixed(1)),
      calories: totalCalories,
      macros: {
        protein: parseFloat(totalProtein.toFixed(1)),
        carbs: parseFloat(totalCarbs.toFixed(1)),
        fat: parseFloat(totalFat.toFixed(1)),
        fiber: parseFloat(totalFiber.toFixed(1)),
        sugar: parseFloat(totalSugar.toFixed(1)),
        sodium: Math.round(totalSodium)
      },
      portionSize: 'Medium',
      estimatedWeight: totalWeight,
      healthScore: Math.min(Math.max(finalHealthScore, 0), 100),
      recommendations: Array.from(recommendationsSet).slice(0, 4), // Cap at 4 clean recommendations
      imageUrl: relativeImageUrl,
      whyPrediction: analysis.why_prediction,
      ingredients: analysis.ingredients,
      confidenceExplanation: analysis.confidence_explanation,
      plateSizeEstimation: analysis.plate_size_estimation,
      topPredictions: analysis.top_predictions,
      detectedItems: analysis.detected_items,
      createdAt: new Date()
    };

    let savedItem;

    if (req.isDbConnected) {
      const scanRecord = new ScanHistory(finalRecord);
      savedItem = await scanRecord.save();
    } else {
      savedItem = {
        _id: 'mem-' + Date.now() + '-' + Math.round(Math.random() * 1000),
        ...finalRecord
      };
      inMemoryHistory.unshift(savedItem);
    }

    res.status(201).json({
      success: true,
      message: 'Plate analyzed and saved successfully.',
      data: savedItem,
      baseNutrition: analysis.detected_items // Send details back so portion resizing is possible on client
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/food/history
 * Fetches previous logs.
 */
exports.getHistory = async (req, res, next) => {
  try {
    const { search } = req.query;

    if (req.isDbConnected) {
      let query = {};
      if (search) {
        query.foodName = { $regex: search, $options: 'i' };
      }
      const mongoList = await ScanHistory.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: mongoList.length, data: mongoList });
    } else {
      let list = [...inMemoryHistory];
      if (search) {
        const keyword = search.toLowerCase();
        list = list.filter((item) => item.foodName.toLowerCase().includes(keyword));
      }
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json({ success: true, count: list.length, data: list });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/food/history/:id
 * Removes log records.
 */
exports.deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.isDbConnected) {
      const deletedItem = await ScanHistory.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({ success: false, message: 'Scan entry not found.' });
      }

      if (deletedItem.imageUrl && deletedItem.imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', deletedItem.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      return res.status(200).json({ success: true, message: 'Scan entry deleted successfully.' });
    } else {
      const index = inMemoryHistory.findIndex((item) => item._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Scan entry not found.' });
      }

      const deletedItem = inMemoryHistory[index];
      inMemoryHistory.splice(index, 1);

      if (deletedItem.imageUrl && deletedItem.imageUrl.startsWith('/uploads/') && !deletedItem.imageUrl.includes('-seed')) {
        const filePath = path.join(__dirname, '..', deletedItem.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      return res.status(200).json({ success: true, message: 'Scan entry deleted successfully (In-Memory).' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/food/history/:id
 * Updates portion size and aggregates nutrients of multi-food plate records.
 */
exports.updateHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { portionSize } = req.body; // 'Small', 'Medium', 'Large'

    // Fetch matching item
    let scanItem;
    if (req.isDbConnected) {
      scanItem = await ScanHistory.findById(id);
    } else {
      scanItem = inMemoryHistory.find(item => item._id === id);
    }

    if (!scanItem) {
      return res.status(404).json({ success: false, message: 'Scan record not found.' });
    }

    // Determine multipliers by portion size category
    // Small: 0.6x, Medium: 1.0x, Large: 1.5x of detected weights
    let scaleFactor = 1.0;
    if (portionSize === 'Small') scaleFactor = 0.6;
    if (portionSize === 'Large') scaleFactor = 1.5;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalWeight = 0;

    // If sub-items list is logged, scale each item relative to its specific portion weight
    if (scanItem.detectedItems && scanItem.detectedItems.length > 0) {
      scanItem.detectedItems.forEach(item => {
        const baseNutrition = item.nutrition;
        
        // Find portion weight inside specific catalog size, or fall back to factor scale
        let itemPortionWeight = baseNutrition.portionSizes?.[portionSize];
        if (!itemPortionWeight) {
          itemPortionWeight = Math.round(item.estimated_weight_g * scaleFactor);
        }

        const multiplier = itemPortionWeight / 100;
        
        totalCalories += Math.round(baseNutrition.calories_per_100g * multiplier);
        totalProtein += (baseNutrition.protein * multiplier);
        totalCarbs += (baseNutrition.carbs * multiplier);
        totalFat += (baseNutrition.fat * multiplier);
        totalFiber += (baseNutrition.fiber * multiplier);
        totalSugar += (baseNutrition.sugar * multiplier);
        totalSodium += Math.round(baseNutrition.sodium * multiplier);
        totalWeight += itemPortionWeight;
      });
    } else {
      // Fallback multiplier for old scans missing sub-items
      const multiplier = scaleFactor;
      totalCalories = Math.round(scanItem.calories * multiplier);
      totalProtein = scanItem.macros.protein * multiplier;
      totalCarbs = scanItem.macros.carbs * multiplier;
      totalFat = scanItem.macros.fat * multiplier;
      totalFiber = scanItem.macros.fiber * multiplier;
      totalSugar = scanItem.macros.sugar * multiplier;
      totalSodium = Math.round(scanItem.macros.sodium * multiplier);
      totalWeight = Math.round(scanItem.estimatedWeight * multiplier);
    }

    const updatedData = {
      portionSize,
      estimatedWeight: totalWeight,
      calories: totalCalories,
      macros: {
        protein: parseFloat(totalProtein.toFixed(1)),
        carbs: parseFloat(totalCarbs.toFixed(1)),
        fat: parseFloat(totalFat.toFixed(1)),
        fiber: parseFloat(totalFiber.toFixed(1)),
        sugar: parseFloat(totalSugar.toFixed(1)),
        sodium: Math.round(totalSodium)
      }
    };

    if (req.isDbConnected) {
      const updatedItem = await ScanHistory.findByIdAndUpdate(id, updatedData, { new: true });
      return res.status(200).json({ success: true, message: 'Scan history updated successfully.', data: updatedItem });
    } else {
      const index = inMemoryHistory.findIndex(item => item._id === id);
      inMemoryHistory[index] = {
        ...inMemoryHistory[index],
        ...updatedData
      };
      return res.status(200).json({
        success: true,
        message: 'Scan history updated successfully (In-Memory).',
        data: inMemoryHistory[index]
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/food/stats
 * Fetches statistics aggregations.
 */
exports.getStats = async (req, res, next) => {
  try {
    let scans = [];
    if (req.isDbConnected) {
      scans = await ScanHistory.find({});
    } else {
      scans = [...inMemoryHistory];
    }

    const aggregated = aggregateStats(scans);
    res.status(200).json({
      success: true,
      data: aggregated
    });
  } catch (error) {
    next(error);
  }
};
