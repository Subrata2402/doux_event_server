const multer = require('multer');
const path = require('path');

/**
 * Multer storage configuration for handling file uploads.
 * 
 * @type {import('multer').StorageEngine}
 * 
 * @property {Function} destination - Function to determine the destination directory for uploaded files.
 * @param {Object} _ - Request object (not used).
 * @param {Object} file - File object containing information about the uploaded file.
 * @param {Function} callback - Callback function to specify the destination directory.
 * 
 * @property {Function} filename - Function to determine the filename for uploaded files.
 * @param {Object} _ - Request object (not used).
 * @param {Object} file - File object containing information about the uploaded file.
 * @param {Function} callback - Callback function to specify the filename.
 */
const storage = multer.diskStorage({
  destination: function (_, file, callback) {
      if (file.fieldname === 'event-image') {
          callback(null, path.join(__dirname, '../public/images'), (err) => {
              if (err) {
                  console.log(err);
              }
          });
      }
  },
  filename: function (_, file, callback) {
      callback(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;