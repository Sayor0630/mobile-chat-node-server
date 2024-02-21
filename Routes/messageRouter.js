// messageRouter.js

const express = require("express");
const Router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allMesages, sendMessages, deleteMessageForEveryone, deleteMessageForMe, deleteMessages, editMessage } = require('../Constrollers/messageController');
const { upload, deleteUploadedFiles } = require('../middleware/multerMiddleware');

Router.route("/:chatId").get(protect, allMesages);
Router.route('/').post(protect, upload.array('images', 50), async (req, res) => {
  try {
    // Call your message sending controller function
    await sendMessages(req, res);
    
    // Delete uploaded files after sending messages
    deleteUploadedFiles(req.files);

  } catch (error) {
    res.status(500).send("Error sending messages");
  }
});

Router.route('/edit').put(protect, editMessage); // Add this route for editing messages

Router.route('/deleteForEveryone').delete(protect, deleteMessageForEveryone);
Router.route('/deleteForMe').delete(protect, deleteMessageForMe);

Router.route("/deleteMessages").post(protect, deleteMessages);

module.exports = Router;
