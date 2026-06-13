const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
    trim: true
  },
  confidence: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  macros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  portionSize: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    default: 'Medium'
  },
  estimatedWeight: {
    type: Number,
    required: true
  },
  healthScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  recommendations: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    required: true
  },
  
  // New Upgraded Fields
  whyPrediction: {
    type: String,
    default: ''
  },
  ingredients: {
    type: [String],
    default: []
  },
  confidenceExplanation: {
    type: String,
    default: ''
  },
  plateSizeEstimation: {
    type: String,
    default: ''
  },
  topPredictions: [
    {
      name: String,
      confidence: Number
    }
  ],
  detectedItems: [
    {
      name: String,
      confidence: Number,
      estimated_weight_g: Number,
      nutrition: mongoose.Schema.Types.Mixed
    }
  ],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
