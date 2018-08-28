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
  let {address} = req.query;    
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

  return Carpool.find({ "endAddress.location": { $nearSphere: 
    { $geometry: { type: "Point", coordinates: [coord.Longitude,coord.Latitude] }, $maxDistance: 5 * METERS_PER_MILE } } }
 )
 .populate('users', '-password')
 .then(x => {   
  return res.status(201).json(x);
}

);
                        
              
  
});

module.exports = router;