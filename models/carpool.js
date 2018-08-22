'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CarpoolSchema = mongoose.Schema({
  carpoolTitle: {type: String, required: true},
  startAddress: {
    streetNumber: {type: String, required: true},
    streetName: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true},
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: []
    }
  },
  endAddress: {
    streetNumber: {type: String, required: true},
    streetName: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true},
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: []
    }
  },
  arrivalTime: {type: String, required: true},
  openSeats: {type: String},
  host: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  details: {type: String, required: true}
});

CarpoolSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});


const Carpool = mongoose.model('Carpool', CarpoolSchema);

module.exports = {Carpool};
