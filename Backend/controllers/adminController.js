import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin user
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate('author', 'name email')
            .populate('approvedBy', 'name')
            .sort({createdAt: -1});
        res.json({success: true, blogs})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

// Get pending blog posts
export const getPendingBlogs = async (req, res) => {
    try {
        const pendingBlogs = await Blog.find({ isPending: true, isPublished: false })
            .populate('author', 'name email')
            .sort({createdAt: -1});
        res.json({success: true, blogs: pendingBlogs})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

// Approve pending blog post
export const approveBlogPost = async (req, res) => {
    try {
        const { id } = req.body;
        await Blog.findByIdAndUpdate(id, {
            isPublished: true,
            isPending: false,
            approvedBy: req.user._id
        });
        res.json({success: true, message: "Blog post approved successfully"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

// Reject pending blog post
export const rejectBlogPost = async (req, res) => {
    try {
        const { id, rejectionReason } = req.body;
        await Blog.findByIdAndUpdate(id, {
            isPending: false,
            rejectionReason: rejectionReason || "Not approved by admin"
        });
        res.json({success: true, message: "Blog post rejected"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const getAllComments = async (req, res) => {
    try{
        const comments = await Comment.find({})
            .populate("blog", "title")
            .populate("user", "name email")
            .populate("approvedBy", "name")
            .sort({createdAt: -1});
        res.json({success: true, comments})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}

// Get pending comments
export const getPendingComments = async (req, res) => {
    try{
        const pendingComments = await Comment.find({ isApproved: false })
            .populate("blog", "title")
            .populate("user", "name email")
            .sort({createdAt: -1});
        res.json({success: true, comments: pendingComments})
    }catch(error){
        res.status(500).json({success: false, message: error.message})
    }
}
export const getDashboard = async (req, res) => {
    try {
        const recentBlogs = await Blog.find({ isPublished: true })
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        
        const totalBlogs = await Blog.countDocuments({ isPublished: true });
        const totalComments = await Comment.countDocuments();
        const pendingBlogs = await Blog.countDocuments({ isPending: true, isPublished: false });
        const pendingComments = await Comment.countDocuments({ isApproved: false });
        const totalUsers = await User.countDocuments({ role: 'user' });

        const dashboardData = {
            totalBlogs,
            totalComments,
            pendingBlogs,
            pendingComments,
            totalUsers,
            recentBlogs
        };

        res.json({ success: true, dashboardData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const deleteCommentById = async (req,res)=>{
    try{
        const {id} =req.body;
        await Comment.findByIdAndDelete(id);
        res.json({success: true, message:"Comment deleted successfully"})

    }catch(error)
    {
           res.json({ success: false, message: error.message });
    }
}
export const approveCommentById = async (req, res) => {
    try{
        const {id} = req.body;
        await Comment.findByIdAndUpdate(id, {
            isApproved: true,
            approvedBy: req.user._id
        });
        res.json({success: true, message: "Comment approved successfully"})
    }catch(error) {
        res.status(500).json({ success: false, message: error.message });
    }
}