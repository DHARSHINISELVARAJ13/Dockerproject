import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    submitBlogPost
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", auth, getUserProfile);
userRouter.post("/submit-blog", auth, upload.single("image"), submitBlogPost);

export default userRouter;
