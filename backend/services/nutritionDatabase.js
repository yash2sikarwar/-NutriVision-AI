const fs = require('fs');
const path = require('path');

// Load local database JSON
const databasePath = path.join(__dirname, 'food_database.json');
let localDatabase = {};

try {
  const rawData = fs.readFileSync(databasePath, 'utf8');
  localDatabase = JSON.parse(rawData);
  console.log(`Loaded ${Object.keys(localDatabase).length} food items from local food_database.json`);
} catch (err) {
  console.error('Failed to load food_database.json:', err.message);
  // Fail-safe basic mapping if file cannot be read
  localDatabase = {
    "grilled chicken": {
      "name": "Grilled Chicken",
      "calories_per_100g": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "fiber": 0,
      "sugar": 0,
      "sodium": 180,
      "category": "Proteins",
      "portionSizes": { "Small": 120, "Medium": 220, "Large": 350 },
      "recommendations": ["Excellent lean protein source."]
    }
  };
}

/**
 * Fuzzy search to match query term to local database keys
 * Uses direct lookup, contains matching, and word token intersection scoring.
 */
const findClosestLocalMatch = (query) => {
  const normalizedQuery = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  const dbKeys = Object.keys(localDatabase);

  // 1. Direct Match
  if (localDatabase[normalizedQuery]) {
    return localDatabase[normalizedQuery];
  }

  // 2. Keyword check: e.g. "grilled chicken salad" -> "salad" or "chicken"
  // Priority contains matches
  for (const key of dbKeys) {
    if (normalizedQuery === key || normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return localDatabase[key];
    }
  }

  // 3. Token-based overlap matching (count common words)
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  let bestKey = null;
  let maxOverlap = 0;

  for (const key of dbKeys) {
    const keyWords = key.split(/\s+/).filter(w => w.length > 2);
    const overlapCount = queryWords.filter(word => keyWords.includes(word)).length;
    
    if (overlapCount > maxOverlap) {
      maxOverlap = overlapCount;
      bestKey = key;
    }
  }

  if (maxOverlap > 0 && bestKey) {
    return localDatabase[bestKey];
  }

  return null;
};

/**
 * Fallback search querying Open Food Facts API (no key required)
 */
const queryOpenFoodFacts = async (query) => {
  console.log(`Querying Open Food Facts API fallback for: "${query}"`);
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&search_simple=1&action=process&json=1`;
    
    // Set a 4-second timeout limit using AbortController
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Open Food Facts API responded with code: ${response.status}`);
    }

    const json = await response.json();
    if (!json.products || json.products.length === 0) {
      return null;
    }

    // Capture the first valid product
    const product = json.products.find(p => p.nutriments && (p.nutriments['energy-kcal_100g'] || p.nutriments.energy_100g));
    if (!product) return null;

    const nutriments = product.nutriments;
    
    // Parse energy from kcal, or convert from kJ (divided by 4.184)
    let calories = 0;
    if (nutriments['energy-kcal_100g'] !== undefined) {
      calories = Math.round(Number(nutriments['energy-kcal_100g']));
    } else if (nutriments.energy_100g !== undefined) {
      calories = Math.round(Number(nutriments.energy_100g) / 4.184);
    }

    const protein = parseFloat(Number(nutriments.proteins_100g || 0).toFixed(1));
    const carbs = parseFloat(Number(nutriments.carbohydrates_100g || 0).toFixed(1));
    const fat = parseFloat(Number(nutriments.fat_100g || 0).toFixed(1));
    const fiber = parseFloat(Number(nutriments.fiber_100g || 0).toFixed(1));
    const sugar = parseFloat(Number(nutriments.sugars_100g || 0).toFixed(1));
    const sodiumMg = Math.round(Number(nutriments.sodium_100g || 0) * 1000); // g to mg

    // Construct profile
    return {
      name: product.product_name || query,
      calories_per_100g: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      fiber: fiber,
      sugar: sugar,
      sodium: sodiumMg,
      category: "Imported Foods",
      portionSizes: { "Small": 100, "Medium": 200, "Large": 300 },
      recommendations: [
        "Retrieved from Open Food Facts database.",
        "Check commercial packaging labels to confirm nutritional counts.",
        "Eat fresh organic ingredients when possible."
      ]
    };

  } catch (err) {
    console.error('Open Food Facts API error:', err.message);
    return null;
  }
};

/**
 * Resolver matching query string to local DB or fetching external fallback
 * @param {string} query - Food query name (e.g. "Chicken Breast")
 * @returns {Promise<object>} - Food nutrient object
 */
const resolveFoodNutrients = async (query) => {
  // 1. Try local database matching
  const localMatch = findClosestLocalMatch(query);
  if (localMatch) {
    console.log(`Local DB matched: "${query}" -> "${localMatch.name}"`);
    return {
      name: localMatch.name,
      calories_per_100g: localMatch.calories_per_100g,
      protein: localMatch.protein,
      carbs: localMatch.carbs,
      fat: localMatch.fat,
      fiber: localMatch.fiber,
      sugar: localMatch.sugar,
      sodium: localMatch.sodium,
      category: localMatch.category,
      portionSizes: localMatch.portionSizes,
      recommendations: localMatch.recommendations
    };
  }

  // 2. Try Open Food Facts API fallback
  const externalMatch = await queryOpenFoodFacts(query);
  if (externalMatch) {
    return externalMatch;
  }

  // 3. Fail-safe default (Mixed Salad values)
  console.warn(`No match found in local database or Open Food Facts for: "${query}". Loading fail-safe defaults.`);
  return {
    name: query,
    calories_per_100g: 75,
    protein: 2.0,
    carbs: 10.0,
    fat: 3.0,
    fiber: 1.5,
    sugar: 2.0,
    sodium: 150,
    category: "General Dish",
    portionSizes: { "Small": 120, "Medium": 200, "Large": 320 },
    recommendations: [
      "Nutrient profiles could not be resolved accurately.",
      "Check packaging labels or USDA guidelines.",
      "Maintain a diverse diet rich in whole vegetables."
    ]
  };
};

module.exports = {
  resolveFoodNutrients,
  findClosestLocalMatch,
  localDatabase
};
