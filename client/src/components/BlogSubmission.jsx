import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { parse } from 'marked';

const BlogSubmission = () => {
    const { axios, user, navigate } = useAppContext();
    const [formData, setFormData] = useState({
        title: '',
        subTitle: '',
        category: '',
        description: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef();
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    const categories = ['Technology', 'Lifestyle', 'Business', 'Health', 'Travel', 'Food', 'Other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // AI content generation function
    const generateContent = async () => {
        if (!formData.title.trim()) {
            return toast.error('Please enter a title first to generate content');
        }

        try {
            setGeneratingAI(true);
            const { data } = await axios.post('/api/blog/generate', { 
                prompt: formData.title 
            });
            
            if (data.success) {
                quillRef.current.root.innerHTML = parse(data.content);
                toast.success('AI content generated successfully!');
            } else {
                toast.error(data.message || 'Failed to generate content');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate AI content');
        } finally {
            setGeneratingAI(false);
        }
    };

    // Initialize Quill editor
    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, { 
                theme: 'snow',
                placeholder: 'Write your blog content here or use AI to generate...'
            });
        }
        return () => {
            quillRef.current = null;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to submit a blog post');
            navigate('/login');
            return;
        }

        if (!formData.title || !formData.description || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('subTitle', formData.subTitle);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const { data } = await axios.post('/api/user/submit-blog', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                toast.success('Blog post submitted successfully! It will be reviewed by our team.');
                // Reset form
                setFormData({
                    title: '',
                    subTitle: '',
                    category: '',
                    description: '',
                    image: null
                });
                setImagePreview('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit blog post');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please login to submit a blog post</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Submit Your Blog Post</h1>
                            <p className="mt-2 text-gray-600">Share your thoughts with our community</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your blog title"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label htmlFor="subTitle" className="block text-sm font-medium text-gray-700">
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    name="subTitle"
                                    id="subTitle"
                                    value={formData.subTitle}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Optional subtitle"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    id="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                    Featured Image
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    id="image"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-40 h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Content *
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    required
                                    rows={12}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Write your blog content here..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit for Review'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> Your blog post will be reviewed by our team before being published. 
                                You'll be notified once it's approved and live on the platform.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BlogSubmission;
