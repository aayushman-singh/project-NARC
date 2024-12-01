import express from 'express';
import { registerUser, authUser, getUser, updateUser } from '../controllers/userControllers.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/signup').post(registerUser);
router.route('/login').post(authUser);

router.route('/').get(protect, getUser)
router.route('/userInfo').put(protect, updateUser)

export default router;
