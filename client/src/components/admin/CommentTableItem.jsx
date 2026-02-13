import React from 'react'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../../context/AppContext'
import toast from 'react-hot-toast'

const CommentTableItem = ({ comment, fetchComments }) => {
  const { blog, createdAt ,_id} = comment
  const BlogDate = new Date(createdAt)
  const {axios} = useAppContext()

  const approveComment = async () =>{
    try{
        const {data} =await axios.post(`api/admin/approve-comment`,{id: _id})
        if(data.success){
          toast.success(data.message)
          fetchComments()
        }else{
          toast.error(data.message)
        }

    }catch(error){
              toast.error(error.message)
    }
  }
  const deleteComment = async () =>{
    try{
      const confirm= window.confirm('Are you sure you want to delete this comment?');
      if(!confirm) return;

        const {data} =await axios.post(`api/admin/delete-comment`,{id: _id})
        if(data.success){
          toast.success(data.message)
          fetchComments()
        }else{
          toast.error(data.message)
        }

    }catch(error){
              toast.error(error.message)
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className='py-4 px-6'>
        <div className='space-y-2'>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blog:</span>
            <p className="text-sm font-medium text-gray-900 mt-1">{blog.title}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From:</span>
            <p className="text-sm text-gray-700 mt-1">{comment.name}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Comment:</span>
            <p className="text-sm text-gray-700 mt-1 max-w-md">{comment.content}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-sm text-gray-500 hidden md:table-cell">
        {BlogDate.toLocaleDateString()}
      </td>
      <td className="py-4 px-6">
        <div className='flex items-center gap-2'>
          {!comment.isApproved ? (
            <button
              onClick={approveComment}
              className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors'
            >
              <img
                src={assets.tick_icon}
                alt="approve"
                className='w-4 h-4 mr-1'
              />
              Approve
            </button>
          ) : (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
              Approved
            </span>
          )}
          <button
            onClick={deleteComment}
            className='inline-flex items-center px-2 py-1.5 text-red-600 hover:text-red-800 transition-colors'
            title="Delete comment"
          >
            <img
              src={assets.bin_icon}
              alt="delete"
              className='w-4 h-4'
            />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default CommentTableItem
