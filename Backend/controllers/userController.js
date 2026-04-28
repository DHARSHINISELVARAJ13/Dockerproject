import User from "../models/User.js";
import Blog from "../models/Blog.js";
import jwt from "jsonwebtoken";
import {
    incrementModerationQueueDepth,
    recordBlogSubmission,
    recordImageUpload,
    recordLoginAttempt,
    recordUserRegistration,
} from "../configs/metrics.js";

// Register User
export const registerUser = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

        if (!name || !email || !password) {
            recordUserRegistration(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            recordUserRegistration(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: 'user'
        });

        await user.save();

        // Record the successful registration after persistence so Grafana reflects real sign-ups.
        recordUserRegistration(req, 'success', 201);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        recordUserRegistration(req, 'failure', 500);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

// Login User
export const loginUser = async (req, res) => {
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

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            recordLoginAttempt(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            recordLoginAttempt(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
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
            message: "Login successful",
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
        console.error("Login error:", error);
        recordLoginAttempt(req, 'failure', 500);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Submit Blog Post (for regular users)
export const submitBlogPost = async (req, res) => {
    try {
        const { title, subTitle, description, category } = req.body;
        const image = req.file;

        console.log("Blog submission data:", { title, subTitle, description, category, image: image?.filename });
        console.log("User:", req.user?.name);

        if (!title || !description || !category) {
            recordBlogSubmission(req, 'failure', 400);
            return res.status(400).json({
                success: false,
                message: "Title, description, and category are required"
            });
        }

        const blog = new Blog({
            title,
            subTitle: subTitle || '',
            description,
            category,
            image: image ? `/uploads/${image.filename}` : '/default-blog-image.jpg',
            author: req.user._id,
            authorName: req.user.name,
            isPending: true,
            isPublished: false
        });

        await blog.save();

        // The submission enters the moderation queue here, so we increment the pending depth immediately.
        recordBlogSubmission(req, 'pending', 201);
        incrementModerationQueueDepth('blog', 1);

        if (image) {
            recordImageUpload(req, image.size, 'success', 201);
        }

        res.status(201).json({
            success: true,
            message: "Blog post submitted for approval! Our team will review it soon.",
            blog
        });
    } catch (error) {
        console.error("Submit blog error:", error);
        recordBlogSubmission(req, 'failure', 500);
        res.status(500).json({
            success: false,
            message: "Server error during blog submission: " + error.message
        });
    }
};
