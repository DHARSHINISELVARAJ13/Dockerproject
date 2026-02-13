import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import Moment from 'moment'
import Loader from '../components/Loader'
import Footer from '../components/Footer'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Blog = () => {
  const { id } = useParams()
  const { axios, user, token, navigate } = useAppContext()

  const [data, setData] = useState(null)
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch single blog data
  const fetchBlogData = async () => {
    try {
      const { data } = await axios.get(`/api/blog/${id}`)
      if (data.success) {
        setData(data.blog)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load blog')
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments
  const fetchComments = async () => {
    try {
      const { data } = await axios.post(`/api/blog/comments`, { blogId: id })
      if (data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load comments')
    }
  }

  // Add new comment
  const addComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to add a comment')
      navigate('/login')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      const { data } = await axios.post(`/api/blog/add-comment`, {
        blog: id,
        name: user.name,
        content: content.trim(),
      })
      
      if (data.success) {
        toast.success('Comment submitted! It will appear after approval.')
        setContent('')
        // Refresh comments to show any approved ones
        fetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    }
  }

  useEffect(() => {
    if (token && user) {
      fetchBlogData()
      fetchComments()
    } else {
      setLoading(false)
    }
  }, [id, token, user])

  // Show loading state
  if (loading) {
    return <Loader />
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">Please login to read this blog post</p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return data ? (
    <div className='relative'>
      {/* Background */}
      <img
        src={assets.gradientBackground}
        alt=""
        className='absolute -top-12 -z-10 opacity-50'
      />

      <Navbar />

      {/* Blog Header */}
      <div className='text-center mt-20 text-gray-600'>
        <p className='text-primary py-4 font-medium'>
          Published on {Moment(data.createdAt).format('MMMM Do YYYY')}
        </p>
        <h1 className='text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800'>
          {data.title}
        </h1>
        <h2 className='my-5 max-w-lg truncate mx-auto'>{data.subTitle}</h2>
        <p className='inline-block py-1 px-4 rounded-full mb-6 border text-sm border-primary/35 bg-primary font-medium text-white'>
          {data.authorName || data.author?.name || 'Anonymous'}
        </p>
      </div>

      {/* Blog Image + Content */}
      <div className='mx-5 max-w-5xl md:mx-auto my-10 mt-6'>
        <img src={data.image} alt="" className='rounded-3xl mb-5' />
        <div
          className='rich-text max-w-3xl mx-auto'
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      </div>

      {/* Comments Section */}
      <div className='mt-14 mb-10 max-w-3xl mx-auto'>
        <p className='font-semibold mb-4'>Comments ({comments.length})</p>
        <div className='flex flex-col gap-4'>
          {comments.map((item, index) => (
            <div
              key={index}
              className='relative bg-primary/5 border border-primary/10 max-w-xl p-4 rounded text-gray-600'
            >
              <div className='flex items-center gap-2 mb-2'>
                <img src={assets.user_icon} alt="" className='w-6' />
                <p className='font-medium'>{item.name}</p>
              </div>
              <p className='text-sm max-w-md ml-8'>{item.content}</p>
              <div className='absolute right-4 bottom-3 text-xs text-gray-500'>
                {Moment(item.createdAt).fromNow()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className='max-w-3xl mx-auto'>
        <p className='font-semibold mb-4'>Add your comment</p>
        {user ? (
          <form onSubmit={addComment} className='flex flex-col items-start gap-4 max-w-lg'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <img src={assets.user_icon} alt="" className='w-5' />
              <span>Commenting as {user.name}</span>
            </div>
            <textarea
              onChange={(e) => setContent(e.target.value)}
              value={content}
              placeholder='Write your comment...'
              className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none'
              required
            />
            <div className='flex justify-between w-full'>
              <p className='text-xs text-gray-500'>Your comment will be reviewed before appearing</p>
              <button
                type="submit"
                className='bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors font-medium'
              >
                Submit Comment
              </button>
            </div>
          </form>
        ) : (
          <div className='max-w-lg p-4 border border-gray-200 rounded-lg bg-gray-50'>
            <p className='text-gray-600 mb-3'>Please login to add a comment</p>
            <button 
              onClick={() => navigate('/login')}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Social Media Share */}
      <div className='my-24 max-w-3xl mx-auto'>
        <p className='font-semibold my-4'>Share this article on social media</p>
        <div className='flex gap-4'>
          <img src={assets.facebook_icon} width={40} alt="Facebook"/>
          <img src={assets.twitter_icon} width={40} alt="Twitter"/>
          <img src={assets.googleplus_icon} width={40} alt="Google Plus"/>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  ) : (
    <Loader />
  )
}

export default Blog
