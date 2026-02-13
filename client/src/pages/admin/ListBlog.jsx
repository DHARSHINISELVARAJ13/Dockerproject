import React, { useState, useEffect } from 'react'
import BlogTableItem from '../../components/admin/BlogTableItem';
import { useAppContext } from '../../../context/AppContext';
import toast from 'react-hot-toast';

const ListBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();
  
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/blogs');
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchBlogs();
  }, [])

  const filteredBlogs = blogs.filter(blog => {
    if (activeTab === 'published') return blog.isPublished;
    if (activeTab === 'pending') return !blog.isPublished;
    return true; // 'all'
  });

  const tabs = [
    { key: 'all', label: 'All Blogs', count: blogs.length },
    { key: 'published', label: 'Published', count: blogs.filter(b => b.isPublished).length },
    { key: 'pending', label: 'Pending', count: blogs.filter(b => !b.isPublished).length }
  ];
  if (loading) {
    return (
      <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-blue-50/50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 p-6 bg-blue-50/50'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Manage Blogs</h1>
          <button 
            onClick={() => window.location.href = '/admin/addBlog'}
            className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
          >
            Add New Blog
          </button>
        </div>

        {/* Tab Navigation */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Table */}
          {filteredBlogs.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-6 font-medium text-gray-700'>#</th>
                    <th className='text-left py-3 px-6 font-medium text-gray-700'>Blog Title</th>
                    <th className='text-left py-3 px-6 font-medium text-gray-700 hidden md:table-cell'>Date</th>
                    <th className='text-left py-3 px-6 font-medium text-gray-700 hidden sm:table-cell'>Status</th>
                    <th className='text-left py-3 px-6 font-medium text-gray-700'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredBlogs.map((blog, index) => (
                    <BlogTableItem 
                      key={blog._id} 
                      blog={blog}
                      fetchBlogs={fetchBlogs} 
                      index={index + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <svg className='w-12 h-12 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No {activeTab === 'all' ? '' : activeTab} blogs found
              </h3>
              <p className='text-gray-500 mb-4'>
                {activeTab === 'pending' 
                  ? 'No blogs are pending approval.'
                  : activeTab === 'published'
                  ? 'No blogs have been published yet.'
                  : 'Get started by creating your first blog post.'
                }
              </p>
              {activeTab === 'all' && (
                <button 
                  onClick={() => window.location.href = '/admin/addBlog'}
                  className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  Create Your First Blog
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListBlog
