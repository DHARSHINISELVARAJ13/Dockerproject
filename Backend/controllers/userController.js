import User from "../models/User.js";
import Blog from "../models/Blog.js";
import jwt from "jsonwebtoken";

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
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
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
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
    } catch (error) {
        console.error("Login error:", error);
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

        res.status(201).json({
            success: true,
            message: "Blog post submitted for approval! Our team will review it soon.",
            blog
        });
    } catch (error) {
        console.error("Submit blog error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during blog submission: " + error.message
        });
    }
};
