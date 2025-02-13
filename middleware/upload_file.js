const multer = require('multer');
const path = require('path');

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