const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CarpoolSchema = mongoose.Schema({
  carpoolTitle: {
    type: String,
    required: true
  },
  startAddress: {
    streetNumber: {type: String, required: true},
    streetName: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true}
  },
  endAddress: {
    streetNumber: {type: String, required: true},
    streetName: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zipcode: {type: String, required: true}
  },
  arrivalTime: {type: Date, required: true},
  openSeats: {type: Number, default: 1},
  phone: {type: String,required: true},
  users: [{
      username: {type: String, required: true},
      host: {type: Boolean, required: true}
  }]
});

CarpoolSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});


const Carpool = mongoose.model('Carpool', CarpoolSchema);

module.exports = {CarpoolSchema};
