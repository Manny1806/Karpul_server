'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {Carpool} = require('../models/carpool');

const router = express.Router();
const passport = require('passport');

const jsonParser = bodyParser.json();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

// Post to register a new user
router.post('/', jsonParser, (req, res) => {

  // console.log(req.body);
  
  let {carpoolTitle, startAddress, endAddress, arrivalTime, openSeats, details} = req.body;

  // startAddress.location.coordinates = [voodoo magic];
  // endAddress.location.coordinates = [voodoo magic];

  return Carpool.create({
    carpoolTitle,
    startAddress,
    endAddress,
    arrivalTime,
    openSeats,
    details,
    host: req.user._id
  })
    .then(carpool => {
      console.log(carpool);
      return res.status(201).json(carpool);
    })
    .catch(err => {
      res.status(500).json({code: 500, message: err});
    });
});


module.exports = router;
