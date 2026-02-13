import mongoose from 'mongoose';
import 'dotenv/config';
import Blog from '../models/Blog.js';

const fixBlogStates = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/quickblog`);
        console.log('Connected to MongoDB');

        // Fix blogs that are published but still marked as pending
        const result = await Blog.updateMany(
            { isPublished: true, isPending: true },
            { isPending: false }
        );

        console.log(`Fixed ${result.modifiedCount} blogs with inconsistent pending states`);

        // Show current blog counts
        const totalBlogs = await Blog.countDocuments({ isPublished: true });
        const pendingBlogs = await Blog.countDocuments({ isPending: true, isPublished: false });
        const rejectedBlogs = await Blog.countDocuments({ isPending: false, isPublished: false });

        console.log('Current blog stats:');
        console.log(`Published blogs: ${totalBlogs}`);
        console.log(`Pending blogs: ${pendingBlogs}`);
        console.log(`Rejected blogs: ${rejectedBlogs}`);

    } catch (error) {
        console.error('Error fixing blog states:', error);
    } finally {
        mongoose.disconnect();
    }
};

fixBlogStates();
