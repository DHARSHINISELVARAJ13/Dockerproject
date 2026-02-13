import { useState, useEffect } from 'react'
import CommentTableItem from '../../components/admin/CommentTableItem'
import { useAppContext } from '../../../context/AppContext'
import toast from 'react-hot-toast'

const Comments = () => {
  const [comments, setComments] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const { axios } = useAppContext();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/comments')
      if (data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const filteredComments = comments.filter(comment => {
    if (activeTab === 'approved') return comment.isApproved === true
    if (activeTab === 'pending') return comment.isApproved === false
    return true // 'all'
  })

  const tabs = [
    { key: 'pending', label: 'Pending', count: comments.filter(c => !c.isApproved).length },
    { key: 'approved', label: 'Approved', count: comments.filter(c => c.isApproved).length },
    { key: 'all', label: 'All', count: comments.length }
  ];

  if (loading) {
    return (
      <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-blue-50/50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 p-6 bg-blue-50/50'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Manage Comments</h1>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-600'>
              <span className='text-orange-600 font-semibold'>{comments.filter(c => !c.isApproved).length}</span> pending approval
            </div>
          </div>
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
          {filteredComments.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-6 font-medium text-gray-700'>Blog & Comment</th>
                    <th className='text-left py-3 px-6 font-medium text-gray-700 hidden md:table-cell'>Date</th>
                    <th className='text-left py-3 px-6 font-medium text-gray-700'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredComments.map((comment, index) => (
                    <CommentTableItem
                      key={comment._id}
                      comment={comment}
                      index={index + 1}
                      fetchComments={fetchComments}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <svg className='w-12 h-12 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No {activeTab === 'all' ? '' : activeTab} comments found
              </h3>
              <p className='text-gray-500'>
                {activeTab === 'pending' 
                  ? 'No comments are pending approval.'
                  : activeTab === 'approved'
                  ? 'No comments have been approved yet.'
                  : 'No comments have been submitted yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Comments
