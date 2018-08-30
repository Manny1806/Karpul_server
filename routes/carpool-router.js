'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const config = require('../config');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const {Carpool} = require('../models/carpool');
const router = express.Router();
const passport = require('passport');

const jsonParser = bodyParser.json();

function generateGeoCoordinates(coordinateObj){
  return [coordinateObj["Longitude"], coordinateObj["Latitude"]];
}

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', (req, res) => {
  const userId = req.user._id;

  return Carpool.find({users: userId})
    .populate('users', '-password')
    .populate('host', '-password')
    .then(carpools => res.json(carpools))
    .catch(err => res.status(500).json(err));
});

// Post to register a new user
router.post('/', jsonParser,  async (req, res) =>  {
  let {carpoolTitle, startAddress, endAddress, arrivalTime, openSeats, details, days} = req.body;  
  let start = `${startAddress.streetNumber} ${startAddress.streetName} ${startAddress.city} ${startAddress.state} ${startAddress.zipcode}`;  

  const coord = await fetch(`${config.GEOCODER_API}?app_id=${config.app_id}&app_code=${config.app_code}&searchText=${start}`)
                        .then((response) => {
                          if (response.status >= 400) {
                            throw new Error('Bad response from server');
                          }
                          return response.json().then(x => x.Response.View[0].Result[0].Location.NavigationPosition[0]);
                        })
                        .catch(err => err);
  const geoStartCoordinates = generateGeoCoordinates(coord);
  startAddress.location = {coordinates: geoStartCoordinates, type:"Point"};

  let end = `${endAddress.streetNumber} ${endAddress.streetName} ${endAddress.city} ${endAddress.state} ${endAddress.zipcode}`;  
  const coordEnd = await fetch(`${config.GEOCODER_API}?app_id=${config.app_id}&app_code=${config.app_code}&searchText=${end}`)
                          .then((response) => {
                            if (response.status >= 400) {
                              throw new Error('Bad response from server');
                            }
                            return response.json().then(x => x.Response.View[0].Result[0].Location.NavigationPosition[0]); //.Result is undefined or doesn't exist
                          })
                          .catch(err => err);
  
  const geoEndCoordinates = generateGeoCoordinates(coordEnd);
  endAddress.location = {coordinates: geoEndCoordinates, type:"Point"};

  const arrive = arrivalTime.split(":").map(digit => parseInt(digit)); 

  const tempObj = {
    carpoolTitle,
    startAddress,
    endAddress,
    arrivalTime: {hrs: arrive[0],mins: arrive[1]},
    openSeats,
    details,
    host: req.user._id,
    days,
    users: [req.user._id]
  };

  console.log(tempObj);
  return Carpool.create(tempObj)
    .then(carpool => {  
      return res.status(201).json(carpool);
    })
    .catch(err => {
      res.status(500).json({code: 500, message: err});
    });
});

// User joining carpool
router.put('/', (req, res, next) => {
  return Carpool.findByIdAndUpdate(req.body.carpoolId, {$addToSet: {users:req.user._id}}, {new: true})
  .then(carpool => {
    res.status(201).json(carpool);
  })
  .catch(err => {
    res.status(500).json({code: 500, message: err});
  })
})

// User leaving carpool
router.put('/leave-carpool', (req, res, next) => {
  return Carpool.findByIdAndUpdate(req.body.carpoolId, {$pull: {users: req.user._id}}, {new: true})
    .then(carpool => {
      console.log(carpool)
      res.status(201).json(carpool);
    })
    .catch(err => {
      res.status(500).json({code: 500, message: err});
    })
})

// Host deleting carpool
router.delete('/', (req, res, next) => {
  return Carpool.findByIdAndRemove(req.body.carpoolId)
  .then(() => {
    res.sendStatus(204);
  })
  .catch(err => {
    res.status(500).json({code: 500, message: err});
  });
});

module.exports = router;
