const mongoose = require('mongoose');

// Comment Schema
const commentSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnvayaLead',  // Reference to the Lead model
    required: [true, 'Lead reference is required'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnvayaSalesAgent',  // Reference to the SalesAgent who authored the comment
    required: [true, 'Author is required'],
  },
  commentText: {
    type: String,
    required: [true, 'Comment text is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Automatically set the creation time
  }
});

module.exports = mongoose.model('AnvayaComment', commentSchema);
