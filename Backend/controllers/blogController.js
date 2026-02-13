import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js"; // ✅ Added missing import
import main from "../configs/gemini.js";

// ➤ Add a new blog (Admin only - direct publish)
export const addBlog = async (req, res) => {
  console.log("=== addBlog function called ===");
  try {
    const { title, subTitle, description, category } = JSON.parse(req.body.blog);
    const imageFile = req.file;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Only admins can directly publish blogs" });
    }

    // Check required fields
    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Simple image handling for now (ImageKit optional)
    let image;
    try {
      if (imagekit && process.env.IMAGEKIT_PUBLIC_KEY) {
        // Use ImageKit if configured
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
          file: fileBuffer,
          fileName: imageFile.originalname,
          folder: "blogs",
        });
        
        image = imagekit.url({
          path: response.filePath,
          transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
        });
      } else {
        // Fallback: use filename for local storage
        image = `/uploads/${imageFile.filename}`;
      }
    } catch (uploadError) {
      console.log("Image upload error, using local file:", uploadError.message);
      image = `/uploads/${imageFile.filename}`;
    }

    await Blog.create({ 
      title, 
      subTitle, 
      description, 
      category, 
      image, 
      isPublished: true,
      isPending: false,
      author: req.user._id,
      authorName: req.user.name,
      approvedBy: req.user._id
    });

    res.json({ success: true, message: "Blog published successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get all published blogs (authenticated users only)
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get blog by ID (authenticated users only, published blogs only)
export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId, isPublished: true })
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Delete blog and its comments
export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);

    // Delete all comments linked to the blog
    await Comment.deleteMany({ blog: id });

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ➤ Toggle publish/unpublish
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.json({ success: true, message: "Blog status updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ➤ Add comment to a blog (authenticated users only)
export const addComment = async (req, res) => {
  try {
    const { blog, content } = req.body;
    
    // Check if blog exists and is published
    const existingBlog = await Blog.findOne({ _id: blog, isPublished: true });
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await Comment.create({ 
      blog, 
      user: req.user._id,
      name: req.user.name,
      content,
      isApproved: false
    });
    
    res.json({ success: true, message: "Comment submitted for approval" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get approved comments for a blog (authenticated users only)
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;
    const comments = await Comment.find({ blog: blogId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required" });
    }

    const content = await main(
      prompt + " Generate a blog content for this topic in simple text format"
    );

    res.json({ success: true, content });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

