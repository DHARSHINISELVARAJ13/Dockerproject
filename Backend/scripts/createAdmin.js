import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';

const createAdminUser = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/quickblog`);
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
