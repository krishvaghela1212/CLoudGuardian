'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createConnection,
  listConnections,
  getConnection,
  updateConnection,
  deleteConnection,
  testConnection,
} = require('../controllers/cloudConnection.controller');

// All routes require JWT authentication
router.use(protect);

// CRUD
router.post('/', createConnection);
router.get('/', listConnections);
router.get('/:id', getConnection);
router.put('/:id', updateConnection);
router.delete('/:id', deleteConnection);

// Test connection (assume role + verify identity)
router.post('/:id/test', testConnection);

module.exports = router;
