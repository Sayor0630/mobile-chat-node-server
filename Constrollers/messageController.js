const asyncHandler=require('express-async-handler')
const Message=require('../Modals/messageModel')
const User=require('../Modals/userModel')
const Chat =require('../Modals/chatModel');
const cloudinary = require('cloudinary').v2; // Import Cloudinary library
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Import Cloudinary storage for multer
const multer = require('multer');

// Initialize Cloudinary configuration
cloudinary.config({
    cloud_name: 'dexsefkns', 
    api_key: '334483197228928', 
    api_secret: 'UITHm6EBI1d_7ruVQZ75LmPserE' 
});

// Initialize Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat_images', // Specify folder name in Cloudinary where images will be stored
        format: async (req, file) => 'png', // You can set the format as per your requirement
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});
const upload = multer({ storage: storage });

const { response } = require('express');
const allMesages = asyncHandler(async (req, res) => {
  console.log("all message");
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    let messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("reciever")
      .populate("chat");

    // Filter out messages deleted for the current user
    messages = messages.filter(message => !message.deletedFor.includes(userId));

    res.json(messages);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});


const sendMessages = asyncHandler(async(req, res) => {
    const { content, chatId } = req.body;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
        // If image files are uploaded, upload each one to Cloudinary
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            imageUrls.push(result.secure_url); // Get the URL of the uploaded image from Cloudinary
        }
    }

    if (!content && imageUrls.length === 0) {
        return res.status(400).json({ message: 'Content or image is required.' });
    }

    const newMessage = {
        sender: req.user._id,
        content: content,
        images: imageUrls, // Store the array of image URLs in the database
        chat: chatId,
    };

    try{
        let message = await Message.create(newMessage);
        console.log(message)
        message=await  message.populate('sender','name')
        message=await  message.populate('chat')
        message=await  message.populate('reciever')
        message=await  User.populate(message,{
            path:'chat.users',  
            select:'name email'
        })
        await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:message,time:new Date()})
        res.json(message)
    }
    catch(err){
        res.status(400)
        throw new Error(err.message)
    }
    

})

const deleteMessages=asyncHandler(async(req,res)=>{
    console.log("delete message called")
    Message.deleteMany({chat:req.body.chatId}).then((response)=>{
        res.send("Deleted all messages in this chat!")
    }).catch((err)=>{
        res.status(400)
        return new Error("Error occured")
    })
    
})

const editMessage = asyncHandler(async(req, res) => {
    const { messageId, content } = req.body;

    try {
        let message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if the user is the sender of the message
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to edit this message' });
        }

        // Update the message content and set the edited flag
        message.content = content;
        message.edited = true;
        await message.save();

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const deleteMessageForEveryone = asyncHandler(async (req, res) => {
    const { messageId } = req.body;
    const userId = req.user._id;

    try {
        const message = await Message.findOneAndDelete({ _id: messageId, sender: userId });

        if (!message) {
            return res.status(404).json({ message: 'Message not found or you are not authorized to delete it' });
        }

        res.status(200).json({ message: 'Message deleted for everyone' });
    } catch (error) {
        console.error('Error deleting message for everyone:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


const deleteMessageForMe = async (req, res) => {
    try {
      const messageId = req.body.messageId;
      const userId = req.user.id; // Assuming user ID is available in the request object
  
      const message = await Message.findById(messageId);
  
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      // Check if the message has already been deleted for the user
      if (message.deletedFor.includes(userId)) {
        return res.status(400).json({ message: "Message already deleted for the user" });
      }
  
      // Add the user ID to the deletedFor array
      message.deletedFor.push(userId);
      await message.save();
  
      res.status(200).json({ message: "Message deleted for the sender" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


module.exports = {
    allMesages,
    sendMessages,
    deleteMessageForEveryone,
    deleteMessageForMe,
    deleteMessages,
    editMessage
};
