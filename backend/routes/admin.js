const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getAnalytics,
  getUsers,
  getUser,
  updateUser,
  getDrawStats,
} = require('../controllers/adminController');

const {
  createCharity,
  updateCharity,
  deleteCharity,
} = require('../controllers/charityController');

const {
  createDraw,
  simulateDraw,
  publishDraw,
} = require('../controllers/drawController');

const {
  adminGetWinners,
  adminVerifyWinner,
  adminMarkPaid,
} = require('../controllers/winnerController');

const {
  adminGetUserScores,
  adminUpdateScore,
} = require('../controllers/scoreController');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer for charity images
const charityUploadDir = path.join(__dirname, '..', 'uploads', 'charities');
if (!fs.existsSync(charityUploadDir)) fs.mkdirSync(charityUploadDir, { recursive: true });

const charityStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, charityUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `charity-${unique}${path.extname(file.originalname)}`);
  },
});
const charityUpload = multer({ storage: charityStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);
router.get('/draw-stats', getDrawStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);

// Score management
router.get('/scores/:userId', adminGetUserScores);
router.put('/scores/:id', adminUpdateScore);

// Charity management
router.post('/charities', charityUpload.single('image'), createCharity);
router.put('/charities/:id', charityUpload.single('image'), updateCharity);
router.delete('/charities/:id', deleteCharity);

// Draw management
router.post('/draws', createDraw);
router.post('/draws/:id/simulate', simulateDraw);
router.post('/draws/:id/publish', publishDraw);

// Winner management
router.get('/winners', adminGetWinners);
router.put('/winners/:id/verify', adminVerifyWinner);
router.put('/winners/:id/pay', adminMarkPaid);

module.exports = router;
