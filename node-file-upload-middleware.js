const axios = require('axios');
const cloudinary = require('cloudinary');

function fileUploadMiddleware(req, res) {
  cloudinary.uploader.upload_stream((result) => {
    // axios({
    //   url: '/api/upload', //API endpoint that needs file URL from CDN
    //   method: 'post',
    //   data: {
    //     url: result.secure_url,
    //     name: req.body.name,
    //     description: req.body.description,
    //   },
    // }).then((response) => {
    //   res.status(200).json(response.data.data);
    // }).catch((error) => {
    //   res.status(500).json(error.response.data);
    // });
   
      res.status(200).json(result.secure_url);
    })
  .end(req.file.buffer);
}
  module.exports = {fileUploadMiddleware} 