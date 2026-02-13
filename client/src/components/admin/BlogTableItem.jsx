import React from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../../context/AppContext';
import toast from 'react-hot-toast';

const BlogTableItem = ({ blog, fetchBlogs, index }) => {
  const { title, createdAt } = blog;
  const BlogDate = new Date(createdAt);
  const { axios } = useAppContext();

  const deleteBlog = async () => {
    const userConfirmed = window.confirm('Are you sure you want to delete this blog?');
    if (!userConfirmed) return;

    try {
      const { data } = await axios.post(`/api/blog/delete`, { id: blog._id });
      if (data.success) {
        toast.success(data.message);
        await fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePublish = async () => {
    try {
      const { data } = await axios.post(`/api/blog/toggle-publish`, { id: blog._id });
      if (data.success) {
        toast.success(data.message);
        await fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <tr className='hover:bg-gray-50'>
      <td className='py-4 px-6 text-sm font-medium text-gray-900'>{index}</td>
      <td className='py-4 px-6'>
        <div className='text-sm font-medium text-gray-900 truncate max-w-xs'>
          {title}
        </div>
      </td>
      <td className='py-4 px-6 text-sm text-gray-500 hidden md:table-cell'>
        {BlogDate.toLocaleDateString()}
      </td>
      <td className='py-4 px-6 hidden sm:table-cell'>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          blog.isPublished 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {blog.isPublished ? 'Published' : 'Pending'}
        </span>
      </td>
      <td className='py-4 px-6'>
        <div className='flex items-center gap-2'>
          <button
            onClick={togglePublish}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md transition-colors ${
              blog.isPublished 
                ? 'text-orange-700 bg-orange-100 hover:bg-orange-200' 
                : 'text-green-700 bg-green-100 hover:bg-green-200'
            }`}
          >
            {blog.isPublished ? 'Unpublish' : 'Approve'}
          </button>
          <button
            onClick={deleteBlog}
            className='inline-flex items-center px-2 py-1.5 text-red-600 hover:text-red-800 transition-colors'
            title="Delete blog"
          >
            <img
              src={assets.cross_icon}
              className='w-4 h-4'
              alt="delete"
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BlogTableItem;
