const express = require('express');
const {
  getConnection,
  getRegions,
  getEC2,
  getS3,
  getRDS,
  getLambda,
} = require('../controllers/aws.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All AWS routes are protected
router.use(protect);

router.get('/connection', getConnection);
router.get('/regions', getRegions);
router.get('/ec2', getEC2);
router.get('/s3', getS3);
router.get('/rds', getRDS);
router.get('/lambda', getLambda);

module.exports = router;
