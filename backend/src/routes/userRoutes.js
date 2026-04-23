import express from 'express';
import userController from '../controllers/userController.js';
const router = express.Router();

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.addUser);
router.post('/users/:id', userController.updateCurrentAccount);
// router.post('/users/:id/rating', userController.adjustRating);
router.post('/reset', userController.resetDatabase);

export default router
