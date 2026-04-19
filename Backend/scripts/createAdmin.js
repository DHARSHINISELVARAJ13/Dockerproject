import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';

const createAdminUser = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('MongoDB URI is missing. Set MONGODB_URI or MONGO_URI.');
        }

        const hasDbInUri = /mongodb(?:\+srv)?:\/\/[^/]+\/[^?]+/.test(mongoUri);
        const connectionUri = hasDbInUri ? mongoUri : `${mongoUri.replace(/\/$/, '')}/quickblog`;

        await mongoose.connect(connectionUri);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create default admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@blog.com',
            password: 'admin123',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@blog.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.disconnect();
    }
};

createAdminUser();
