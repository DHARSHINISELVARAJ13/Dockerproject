import React, { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import BlogList from '../components/BlogList'
import NewsLetter from '../components/NewsLetter'
import Footer from '../components/Footer'
import Loader from '../components/Loader'

const Home = () => {
  const { token, user, isLoading, navigate, fetchBlogs } = useAppContext()

  useEffect(() => {
    if (!isLoading && token && user) {
      fetchBlogs()
    }
  }, [isLoading, token, user])

  // Show loading state while checking authentication
  if (isLoading) {
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to QuickBlog</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our exclusive community to access amazing blog content and share your own stories.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create Account
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Authentication required to access blog content
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Navbar/>
      <Header/>
      <BlogList/>
      <NewsLetter/>
      <Footer/>
    </>
  )
}

export default Home
