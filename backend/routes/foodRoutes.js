const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middleware/uploadMiddleware');

// Route for food analysis (Multer single file upload)
router.post('/analyze', upload.single('image'), foodController.analyzeImage);

// Route for history list retrieval
router.get('/history', foodController.getHistory);

// Route for deleting history logs
router.delete('/history/:id', foodController.deleteHistory);

// Route for updating scan portion size
router.put('/history/:id', foodController.updateHistory);

// Route for analytics graphs and summary cards
router.get('/stats', foodController.getStats);

module.exports = router;
