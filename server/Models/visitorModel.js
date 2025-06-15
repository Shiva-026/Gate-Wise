const mongoose = require('mongoose');


const visitorSchema = new mongoose.Schema({
  name: 
  {
    type: String,
    required: true 
  },
  contact: { type: String, required: true },
  reason:{ type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  uniqueId: { type: String, required: true },
  visitorId: { type: String, required: true, unique: true },
  fromTime: {
        type: Date,
        required: true
    },
    toTime: {
        type: Date,
        required: true
    },
    photo: { type: String, default: null },

    issuedAt: {
    type: Date,
    default: Date.now
  },

    validated: {
    type: Boolean,
    default: true
  }
});


const visitorModel= mongoose.model('Visitor', visitorSchema);
module.exports =visitorModel;