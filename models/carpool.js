'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;



const GeoSchema = new mongoose.Schema({
  type: {type: String, default: 'Point'},
  coordinates: []
});

const CarpoolSchema = mongoose.Schema({
  carpoolTitle: {type: String, required: true},
  startAddress: {
    streetNumber: {type: String, required: true},
    streetName: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true},
    location: GeoSchema},  
  endAddress: {
    streetNumber: {type: String, required: true},
    streetName: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true},
    location: GeoSchema},
  arrivalTime: {type: String, required: true},
  openSeats: {type: String},
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  details: {type: String, required: true},
  days: [
    {type: String}
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      unique: true
    }
  ]
});

CarpoolSchema.index({'startAddress.location': '2dsphere' });
CarpoolSchema.index({'endAddress.location': '2dsphere' });

CarpoolSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

const Carpool = mongoose.model('Carpool', CarpoolSchema);

module.exports = {Carpool};