const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Function to ensure the uploads folder exists
function ensureUploadsFolder() {
  const uploadFolder = 'uploads';
  // Check if the uploads folder exists synchronously
  if (!fs.existsSync(uploadFolder)) {
    // If the uploads folder doesn't exist, create it synchronously
    fs.mkdirSync(uploadFolder);
  }
}

// Call the function to ensure the uploads folder exists
ensureUploadsFolder();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // You can add file filter logic here if needed
    cb(null, true);
  }
});

// Function to delete uploaded files
function deleteUploadedFiles(files) {
  files.forEach(file => {
    fs.unlink(path.join('uploads/', file.filename), err => {
      if (err) {
        console.error(`Error deleting file ${file.filename}: ${err}`);
      } else {
        console.log(`Deleted file ${file.filename}`);
      }
    });
  });
}

module.exports = { upload, deleteUploadedFiles };
