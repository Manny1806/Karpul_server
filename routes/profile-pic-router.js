'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('../models/user-model');

const router = express.Router();

const jsonParser = bodyParser.json();


router.post('/', (req, res) => {
    console.log(req.body.id)
  return User.findById(req.body.id)
    .then(user => {
      user.profilePicUrl = req.body.profilePicUrl
      user.save()
      return user
    })
    .then(user => res.json(user.serialize()))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;