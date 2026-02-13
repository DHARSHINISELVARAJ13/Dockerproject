import express from 'express';
import {
  adminLogin,
  approveCommentById,
  deleteCommentById,
  getAllBlogsAdmin,
  getAllComments,
  getDashboard,
  getPendingBlogs,
  getPendingComments,
  approveBlogPost,
  rejectBlogPost
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/auth.js';

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/dashboard", adminAuth, getDashboard);
adminRouter.get("/blogs", adminAuth, getAllBlogsAdmin);
adminRouter.get("/pending-blogs", adminAuth, getPendingBlogs);
adminRouter.post("/approve-blog", adminAuth, approveBlogPost);
adminRouter.post("/reject-blog", adminAuth, rejectBlogPost);
adminRouter.get("/comments", adminAuth, getAllComments);
adminRouter.get("/pending-comments", adminAuth, getPendingComments);
adminRouter.post("/approve-comment", adminAuth, approveCommentById);
adminRouter.post("/delete-comment", adminAuth, deleteCommentById);

export default adminRouter;
