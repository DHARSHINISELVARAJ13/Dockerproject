import React, { useState, useEffect, useRef } from "react";
import { assets, blogCategories } from "../../assets/assets";
import Quill from "quill";
import { useAppContext } from "../../../context/AppContext";
import toast from "react-hot-toast";
import {parse} from 'marked'

const AddBlog = () => {
  const { axios } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);

  // handle image change with preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // optional AI generator (currently empty)
  const generateContent = async () => {
    if(!title) return toast.error('Please enter a title')
      try{
    setLoading(true);
    const{data} = await axios.post(`/api/blog/generate`,{prompt: title})
    if(data.success){
      quillRef.current.root.innerHTML = parse(data.content)
    }else{
      toast.error(data.message)
    }

    }catch(error){
      toast.error(error.message)
    }finally{
      setLoading(false)
    }
  };

  // submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!image) {
      toast.error('Please select a thumbnail image');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    
    if (!quillRef.current?.root?.innerHTML?.trim() || quillRef.current.root.innerHTML === '<p><br></p>') {
      toast.error('Please add blog content');
      return;
    }

    try {
      setIsAdding(true);

      const blog = {
        title: title.trim(),
        subTitle: subTitle.trim(),
        description: quillRef.current.root.innerHTML,
        category,
        isPublished,
      };

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blog));
      formData.append("image", image);

      const { data } = await axios.post("/api/blog/add", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message || 'Blog added successfully!');
        // reset form
        setImage(null);
        setImagePreview(null);
        setTitle("");
        setSubTitle("");
        if (quillRef.current) {
          quillRef.current.root.innerHTML = "";
        }
        setCategory("Startup");
        setIsPublished(false);
      } else {
        toast.error(data.message || 'Failed to add blog');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add blog');
    } finally {
      setIsAdding(false);
    }
  };

  // initialize quill
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
    return () => {
      quillRef.current = null; // cleanup
    };
  }, []);

  return (
    <div className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Create New Blog Post</h1>
            <p className="text-gray-600 mt-2">Share your thoughts and ideas with the world</p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* Upload thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Thumbnail *
              </label>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <img
                    src={imagePreview || assets.upload_area}
                    alt="Blog thumbnail preview"
                    className="h-20 w-20 object-cover rounded-lg border-2 border-dashed border-gray-300"
                  />
                </div>
                <label htmlFor="image" className="cursor-pointer">
                  <div className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Choose Image
                  </div>
                  <input
                    onChange={handleImageChange}
                    type="file"
                    id="image"
                    accept="image/*"
                    hidden
                  />
                </label>
              </div>
              {!image && <p className="text-xs text-gray-500 mt-1">Upload a thumbnail image for your blog post</p>}
            </div>

            {/* Blog title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                placeholder="Enter an engaging title for your blog post"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                placeholder="Add a subtitle to provide more context"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) => setSubTitle(e.target.value)}
                value={subTitle}
              />
            </div>

            {/* Blog description (Quill editor) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Content *
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="relative h-80">
                  <div ref={editorRef} className="h-full"></div>
                  <button 
                    disabled={loading}
                    type="button"
                    onClick={generateContent}
                    className="absolute bottom-3 right-3 text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-3 py-1.5 rounded-md transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Use the AI generator to create content based on your title</p>
            </div>

            {/* Category and Publish options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {blogCategories.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Status
                </label>
                <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!isPublished}
                      onChange={() => setIsPublished(false)}
                      className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Save as Draft</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isPublished}
                      onChange={() => setIsPublished(true)}
                      className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publish Now</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.location.href = '/admin/listBlog'}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isAdding}
                type="submit"
                className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
              >
                {isAdding ? "Creating..." : isPublished ? "Publish Blog" : "Save Draft"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
