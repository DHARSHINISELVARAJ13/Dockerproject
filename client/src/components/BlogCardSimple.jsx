import React from 'react';

const BlogCardSimple = ({ blog }) => {
  console.log('Blog data:', blog);
  
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3>{blog.title || 'No Title'}</h3>
      <p>Author: {typeof blog.author === 'object' ? blog.author?.name || blog.authorName : blog.author || 'Anonymous'}</p>
      <p>Category: {blog.category || 'No Category'}</p>
    </div>
  );
};

export default BlogCardSimple;
