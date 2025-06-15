const mongoose = require('mongoose');

const RequestPassSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        ref: 'student'  // optional, helps with population if needed
    },
    reason: {
        type: String,
        required: true
    },
    fromTime: {
        type: Date,
        required: true
    },
    toTime: {
        type: Date,
        required: true
    },
    requestedOn: {
        type: Date,
        default: Date.now // Automatically sets current date & time
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
});


const RequestPassModel= mongoose.model('RequestPass', RequestPassSchema);
module.exports=RequestPassModel;
