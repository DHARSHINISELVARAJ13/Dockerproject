import express from "express";
import {
  addBlog,
  addComment,
  deleteBlogById,
  generateContent,
  getAllBlogs,
  getBlogById,
  getBlogComments,
  togglePublish,
} from "../controllers/blogController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";
import { adminAuth } from "../middleware/auth.js";

const blogRouter = express.Router();

// Blog routes (admin only)
blogRouter.post("/add", adminAuth, upload.single("image"), addBlog);
blogRouter.post("/delete", adminAuth, deleteBlogById);
blogRouter.post("/toggle-publish", adminAuth, togglePublish);

// AI content generation (available to all authenticated users)
blogRouter.post("/generate", auth, generateContent);

// Blog routes (authenticated users)
blogRouter.get("/all", auth, getAllBlogs);
blogRouter.get("/:blogId", auth, getBlogById);

// Comment routes (authenticated users)
blogRouter.post("/add-comment", auth, addComment);
blogRouter.post("/comments", auth, getBlogComments);

export default blogRouter;
