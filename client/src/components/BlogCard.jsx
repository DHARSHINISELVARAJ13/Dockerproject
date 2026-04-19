import React from 'react';
import { useNavigate } from 'react-router-dom';
import Moment from 'moment';
import { useAppContext } from '../../context/AppContext';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();
  const { _id, title, description, category, image, createdAt, author, authorName } = blog;
  const { getImageUrl } = useAppContext();

  // Clean HTML from description for preview
  const cleanDescription = description?.replace(/<[^>]*>/g, '') || '';

  return (
    <div
      onClick={() => navigate(`/blog/${_id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
    >
      <div className="relative overflow-hidden">
        <img 
          src={getImageUrl(image) || '/placeholder-image.jpg'} 
          alt={title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {cleanDescription.slice(0, 120)}...
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{authorName || author?.name || 'Anonymous'}</span>
          <span>{Moment(createdAt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
