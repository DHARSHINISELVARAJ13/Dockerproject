import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { useAppContext } from '../../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalBlogs: 0,
        publishedBlogs: 0,
        pendingBlogs: 0,
        totalComments: 0,
        pendingComments: 0,
        totalUsers: 0,
        recentBlogs: []
    })
    const [loading, setLoading] = useState(true)

    const { axios } = useAppContext()

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get('/api/admin/dashboard')
            if (data.success) {
                setDashboardData(data.dashboardData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <div className='flex-1 p-4 md:p-10 bg-blue-50/50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex-1 p-4 md:p-10 bg-blue-50/50'>
            <h1 className='text-2xl font-bold text-gray-800 mb-6'>Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Total Blogs</p>
                            <p className='text-2xl font-bold text-gray-900'>{dashboardData.totalBlogs}</p>
                        </div>
                        <div className='p-3 bg-blue-100 rounded-full'>
                            <img src={assets.dashboard_icon_1} alt="" className='w-6 h-6'/>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Pending Blogs</p>
                            <p className='text-2xl font-bold text-orange-600'>{dashboardData.pendingBlogs}</p>
                        </div>
                        <div className='p-3 bg-orange-100 rounded-full'>
                            <img src={assets.dashboard_icon_3} alt="" className='w-6 h-6'/>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Pending Comments</p>
                            <p className='text-2xl font-bold text-red-600'>{dashboardData.pendingComments}</p>
                        </div>
                        <div className='p-3 bg-red-100 rounded-full'>
                            <img src={assets.dashboard_icon_2} alt="" className='w-6 h-6'/>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Total Users</p>
                            <p className='text-2xl font-bold text-green-600'>{dashboardData.totalUsers}</p>
                        </div>
                        <div className='p-3 bg-green-100 rounded-full'>
                            <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z'></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white'>
                    <h3 className='font-semibold mb-2'>Quick Actions</h3>
                    <p className='text-blue-100 text-sm mb-4'>Manage your content efficiently</p>
                    <div className='flex gap-2'>
                        <button 
                            onClick={() => window.location.href = '/admin/addBlog'}
                            className='bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm transition-colors'
                        >
                            Add Blog
                        </button>
                        <button 
                            onClick={() => window.location.href = '/admin/comments'}
                            className='bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm transition-colors'
                        >
                            Review Comments
                        </button>
                    </div>
                </div>

                <div className='bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white'>
                    <h3 className='font-semibold mb-2'>Pending Approvals</h3>
                    <p className='text-orange-100 text-sm mb-4'>
                        {dashboardData.pendingBlogs + dashboardData.pendingComments} items need attention
                    </p>
                    <button 
                        onClick={() => window.location.href = '/admin/listBlog'}
                        className='bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm transition-colors'
                    >
                        Review Now
                    </button>
                </div>

                <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white'>
                    <h3 className='font-semibold mb-2'>Published Today</h3>
                    <p className='text-green-100 text-sm mb-4'>Keep the momentum going</p>
                    <div className='text-2xl font-bold'>{dashboardData.publishedBlogs}</div>
                </div>
            </div>

            {/* Recent Blogs Table */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                    <div className='flex items-center gap-3'>
                        <img src={assets.dashboard_icon_4} alt="" className='w-6 h-6'/>
                        <h2 className='text-lg font-semibold text-gray-800'>Recent Blogs</h2>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/admin/listBlog'}
                        className='text-indigo-600 hover:text-indigo-800 text-sm font-medium'
                    >
                        View All
                    </button>
                </div>
                
                {dashboardData.recentBlogs.length > 0 ? (
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
                                {dashboardData.recentBlogs.map((blog, index) => (
                                    <BlogTableItem 
                                        key={blog._id} 
                                        blog={blog}
                                        fetchBlogs={fetchDashboard} 
                                        index={index + 1}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className='text-center py-8 text-gray-500'>
                        <p>No recent blogs found</p>
                        <button 
                            onClick={() => window.location.href = '/admin/addBlog'}
                            className='mt-2 text-indigo-600 hover:text-indigo-800 font-medium'
                        >
                            Create your first blog
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Dashboard
