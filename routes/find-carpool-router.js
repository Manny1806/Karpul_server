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

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/', async (req, res) => {
  const userId = req.user._id;
  //destination entered by user in find carpools search bar
  let {address,days,from,to} = req.query;    


  const fromTime = from.split(":").map(digit => parseInt(digit));
  const toTime = to.split(":").map(digit => parseInt(digit));




  //get longitude and latitude
  const coord = await fetch(`${config.GEOCODER_API}?app_id=${config.app_id}&app_code=${config.app_code}&searchText=${address}`)
                        .then((response) => {
                          if (response.status >= 400) {
                            throw new Error('Bad response from server');
                          }
                          return response.json().then(x => x.Response.View[0].Result[0].Location.NavigationPosition[0]);
                        })
                        .catch(err => err);

  const METERS_PER_MILE = 1609.34;

  const daysList = days && days.split(",").map(day => ({days:`${day}`}));

  let mongoQueryObj = { "endAddress.location": { $nearSphere: 
    { $geometry: { type: "Point", coordinates: [coord.Longitude,coord.Latitude] }, $maxDistance: 5 * METERS_PER_MILE } }
  };

  if(daysList){
    mongoQueryObj['$or'] = daysList;
  } 
  
  if(fromTime && toTime){
    mongoQueryObj['$and'] = [
      
      {$or: [{ $and: [ {'arrivalTime.hrs': {$eq:fromTime[0]}},{'arrivalTime.mins': {$gte:fromTime[1]}} ] },
             { $and: [ {'arrivalTime.hrs': {$gt:fromTime[0]}} ] }]},
    
      {$or: [{ $and: [ {'arrivalTime.hrs': {$eq:toTime[0]}},{'arrivalTime.mins': {$lte:toTime[1]}} ] },
             { $and: [ {'arrivalTime.hrs': {$lt:toTime[0]}} ] }]}
              
            ];

    /* {$and : [{$or: [{ $and: [ {'arrivalTime.hrs': {$eq:fromTime[0]}},{'arrivalTime.mins': {$gte:fromTime[1]}} ] },
        { $and: [ {'arrivalTime.hrs': {$gt:fromTime[0]}} ] }]},
        
        {$or: [{ $and: [ {'arrivalTime.hrs': {$eq:toTime[0]}},{'arrivalTime.mins': {$lte:toTime[1]}} ] },
        { $and: [ {'arrivalTime.hrs': {$lt:toTime[0]}} ] }]}]    } */
  }

  

      

  //$where: "getFutureCarpools(this.arrivalTime)"
  return Carpool.find(mongoQueryObj)
    .populate('host', '-password')
    .then(x => {   
      let response = {
        geoCoord: [coord.Longitude,coord.Latitude],
        results: x
      };      
      return res.status(201).json(response);
    });
});

module.exports = router;