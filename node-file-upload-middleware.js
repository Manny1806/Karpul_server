const axios = require('axios');
const cloudinary = require('cloudinary');

function fileUploadMiddleware(req, res) {
  // console.log(req.body)
  cloudinary.uploader.upload_stream((result) => {
      
      res.status(200).json(result.secure_url);
    },{public_id: req.body.public_id})
  .end(req.file.buffer);
}
  module.exports = {fileUploadMiddleware} 