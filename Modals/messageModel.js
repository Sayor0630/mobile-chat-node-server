const mongoose = require('mongoose');

// messageModel.js

const messageModal = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        trim: true,
    },
    images: [{
        type: String,
    }],
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    time: { 
        type: Date, 
        default: Date.now
    },
    edited: {
        type: Boolean,
        default: false
    },
    deletedFor: {
        type: [mongoose.Schema.Types.ObjectId], // Array of user IDs who have deleted the message
        default: []
      }
}, {
    timestamps: true
});

const Message = mongoose.model("Message", messageModal);
module.exports = Message;
