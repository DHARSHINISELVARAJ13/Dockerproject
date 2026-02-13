import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({success: false, message: "Access denied. No token provided"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({success: false, message: "Invalid token"});
        }
        
        req.user = user;
        next();
    } catch(error) {
        res.status(401).json({success: false, message: "Invalid token"});
    }
}

// Admin-only middleware
export const adminAuth = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({success: false, message: "Access denied. No token provided"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({success: false, message: "Access denied. Admin only"});
        }
        
        req.user = user;
        next();
    } catch(error) {
        res.status(401).json({success: false, message: "Invalid token"});
    }
}

export default auth;