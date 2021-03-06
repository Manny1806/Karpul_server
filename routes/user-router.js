'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('../models/user-model');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'firstName', 'lastName', 'phone'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password','firstName', 'lastName', 'phone'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password','firstName', 'lastName', 'phone'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 6,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName, lastName, phone } = req.body;
  let profilePicUrl = "https://www.freeiconspng.com/uploads/no-image-icon-11.PNG"
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this  
  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password      
      return User.hashPassword(password);
    })
    .then(hash => {      
      return User.create({
        username,
        password: hash,
        firstName,
        lastName,
        phone,
        profilePicUrl
      });
    })
    .then(user => {      
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// Never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:username', (req, res) => {
  const {username} = req.params
  return User.findOne({username})
    .then(user => res.json(user.profilePicUrl))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/userData/:id', (req, res) => {
  return User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.post('/userData', (req, res) => {
  return User.findById(req.body.id)
    .then(user => {      
      user.bio = req.body.bio;
      user.phone = req.body.phone;
      user.state = req.body.state;
      user.city = req.body.city;
      user.save();
      return res.json(user);})
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.post('/:id', (req, res) => {  
  return User.findById(req.params.id)
    .then(user => {
      user.profilePicUrl = req.body.profilePicUrl;
      user.save();
      return user;
    })
    .then(user => res.json(user.serialize()))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
