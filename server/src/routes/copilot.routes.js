const express = require('express');
const { askQuestion, getHistory } = require('../controllers/copilot.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/ask', askQuestion);
router.get('/history', getHistory);

module.exports = router;
