import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import {
    decrementModerationQueueDepth,
    recordBlogModeration,
    recordCommentModeration,
    recordLoginAttempt,
    recordModerationLatencyFromCreatedAt,
    setModerationQueueDepth,
} from '../configs/metrics.js';

export const adminLogin = async (req, res) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

        if (!email || !password) {
            recordLoginAttempt(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find admin user
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            recordLoginAttempt(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            recordLoginAttempt(req, 'failure', 400);
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

        recordLoginAttempt(req, 'success', 200);
    } catch (error) {
        recordLoginAttempt(req, 'failure', 500);
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
        const blog = await Blog.findById(id);

        if (!blog) {
            recordBlogModeration(req, 'failure', 404);
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        await Blog.findByIdAndUpdate(id, {
            isPublished: true,
            isPending: false,
            approvedBy: req.user._id
        });
        recordBlogModeration(req, 'approved', 200);
        recordModerationLatencyFromCreatedAt(req, 'blog', 'approved', blog.createdAt);
        decrementModerationQueueDepth('blog', 1);
        res.json({success: true, message: "Blog post approved successfully"})
    } catch (error) {
        recordBlogModeration(req, 'failure', 500);
        res.status(500).json({success: false, message: error.message})
    }
}

// Reject pending blog post
export const rejectBlogPost = async (req, res) => {
    try {
        const { id, rejectionReason } = req.body;
        const blog = await Blog.findById(id);

        if (!blog) {
            recordBlogModeration(req, 'failure', 404);
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        await Blog.findByIdAndUpdate(id, {
            isPending: false,
            rejectionReason: rejectionReason || "Not approved by admin"
        });
        recordBlogModeration(req, 'rejected', 200);
        recordModerationLatencyFromCreatedAt(req, 'blog', 'rejected', blog.createdAt);
        decrementModerationQueueDepth('blog', 1);
        res.json({success: true, message: "Blog post rejected"})
    } catch (error) {
        recordBlogModeration(req, 'failure', 500);
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

        // Use the dashboard counts as an authoritative refresh so the queue-depth gauge matches the current backlog.
        setModerationQueueDepth({ blogPending: pendingBlogs, commentPending: pendingComments });

        res.json({ success: true, dashboardData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const deleteCommentById = async (req,res)=>{
    try{
        const {id} =req.body;
        const comment = await Comment.findById(id);

        if (!comment) {
            recordCommentModeration(req, 'failure', 404);
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        await Comment.findByIdAndDelete(id);
        recordCommentModeration(req, 'rejected', 200);
        if (!comment.isApproved) {
            decrementModerationQueueDepth('comment', 1);
        }
        res.json({success: true, message:"Comment deleted successfully"})

    }catch(error)
    {
           recordCommentModeration(req, 'failure', 500);
           res.json({ success: false, message: error.message });
    }
}
export const approveCommentById = async (req, res) => {
    try{
        const {id} = req.body;
        const comment = await Comment.findById(id);

        if (!comment) {
            recordCommentModeration(req, 'failure', 404);
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        await Comment.findByIdAndUpdate(id, {
            isApproved: true,
            approvedBy: req.user._id
        });
        recordCommentModeration(req, 'approved', 200);
        recordModerationLatencyFromCreatedAt(req, 'comment', 'approved', comment.createdAt);
        decrementModerationQueueDepth('comment', 1);
        res.json({success: true, message: "Comment approved successfully"})
    }catch(error) {
        recordCommentModeration(req, 'failure', 500);
        res.status(500).json({ success: false, message: error.message });
    }
}