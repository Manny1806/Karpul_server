'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {Carpool} = require('../models/carpool');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['carpoolTitle', 'startAddress', 'endAddress', 'arrivalTime', 'openSeats', 'users'];
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

  let {carpoolTitle, startAddress, endAddress, arrivalTime, openSeats, users } = req.body;
  

  
return Carpool.create({
    carpoolTitle,
    startAddress,
    endAddress,
    arrivalTime,
    openSeats,
    users
    
})
.then(carpool => {
    return res.status(201).json(carpool);
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


module.exports = router;
