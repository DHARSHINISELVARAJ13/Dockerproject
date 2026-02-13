import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
   blog: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
   user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
   name: {type: String, required: true},
   content: {type: String, required: true},
   isApproved: {type: Boolean, default: false},
   approvedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
   }
}, {timestamps: true});
const Comment = mongoose.model('Comment',commentSchema);
export default Comment;