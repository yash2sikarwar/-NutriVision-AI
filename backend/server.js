const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrivision';
let isDbConnected = false;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB successfully connected.');
    isDbConnected = true;
  })
  .catch((err) => {
    console.error('WARNING: MongoDB connection failed:', err.message);
    console.log('Backend will operate in Mock Database/In-Memory mode for history tracking.');
  });

// Attach DB status to request
app.use((req, res, next) => {
  req.isDbConnected = isDbConnected;
  next();
});

// Import Routes
const foodRoutes = require('./routes/foodRoutes');
app.use('/api/food', foodRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: isDbConnected ? 'connected' : 'offline (using in-memory store)',
    timestamp: new Date()
  });
});

// Serve frontend build static files in production if needed
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Internal Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`NutriVision AI Backend Running on Port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});
