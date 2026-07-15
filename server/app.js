const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/error.middleware');
const authRoutes = require('./src/routes/auth.routes');
const awsRoutes = require('./src/routes/aws.routes');
const copilotRoutes = require('./src/routes/copilot.routes');
const reportRoutes = require('./src/routes/report.routes');
const logger = require('./src/utils/logger');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/aws', awsRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/reports', reportRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'CloudGuardian API is running!' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
