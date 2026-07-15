const express = require('express');
const { getLatestReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/latest', getLatestReport);

module.exports = router;
