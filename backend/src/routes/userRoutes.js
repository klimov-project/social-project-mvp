const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.addUser);
router.post('/users/:id/rating', userController.adjustRating);
router.post('/users/:id/feedback', userController.leaveFeedback);
router.post('/reset', userController.resetDatabase);
router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
