'use strict';

const cloudConnectionService = require('../services/cloudConnection/cloudConnection.service');
const logger = require('../utils/logger');

// @desc    Create a new cloud connection
// @route   POST /api/cloud-connections
// @access  Private
exports.createConnection = async (req, res, next) => {
  try {
    const connection = await cloudConnectionService.createConnection(
      req.user._id.toString(),
      req.body
    );
    res.status(201).json({ success: true, message: 'Connection created successfully.', data: connection });
  } catch (error) {
    logger.error(`[CloudConnection Controller] createConnection: ${error.message}`);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A connection with this name already exists.' });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join('. ');
      return res.status(400).json({ success: false, message: messages });
    }
    next(error);
  }
};

// @desc    Get all cloud connections for the authenticated user
// @route   GET /api/cloud-connections
// @access  Private
exports.listConnections = async (req, res, next) => {
  try {
    const connections = await cloudConnectionService.listConnections(req.user._id.toString());
    res.status(200).json({ success: true, data: connections });
  } catch (error) {
    logger.error(`[CloudConnection Controller] listConnections: ${error.message}`);
    next(error);
  }
};

// @desc    Get a single cloud connection by ID
// @route   GET /api/cloud-connections/:id
// @access  Private
exports.getConnection = async (req, res, next) => {
  try {
    const connection = await cloudConnectionService.getConnectionById(
      req.user._id.toString(),
      req.params.id
    );
    res.status(200).json({ success: true, data: connection });
  } catch (error) {
    logger.error(`[CloudConnection Controller] getConnection: ${error.message}`);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Update a cloud connection
// @route   PUT /api/cloud-connections/:id
// @access  Private
exports.updateConnection = async (req, res, next) => {
  try {
    const connection = await cloudConnectionService.updateConnection(
      req.user._id.toString(),
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, message: 'Connection updated successfully.', data: connection });
  } catch (error) {
    logger.error(`[CloudConnection Controller] updateConnection: ${error.message}`);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A connection with this name already exists.' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join('. ');
      return res.status(400).json({ success: false, message: messages });
    }
    next(error);
  }
};

// @desc    Delete a cloud connection
// @route   DELETE /api/cloud-connections/:id
// @access  Private
exports.deleteConnection = async (req, res, next) => {
  try {
    await cloudConnectionService.deleteConnection(
      req.user._id.toString(),
      req.params.id
    );
    res.status(200).json({ success: true, message: 'Connection deleted successfully.' });
  } catch (error) {
    logger.error(`[CloudConnection Controller] deleteConnection: ${error.message}`);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Test a cloud connection by assuming the IAM role
// @route   POST /api/cloud-connections/:id/test
// @access  Private
exports.testConnection = async (req, res, next) => {
  try {
    const result = await cloudConnectionService.testConnection(
      req.user._id.toString(),
      req.params.id
    );
    const statusCode = result.success ? 200 : 422;
    res.status(statusCode).json({ success: result.success, data: result });
  } catch (error) {
    logger.error(`[CloudConnection Controller] testConnection: ${error.message}`);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};
