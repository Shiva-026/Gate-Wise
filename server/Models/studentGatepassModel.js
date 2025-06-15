const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // UUID package

const studentGatePassSchema = new mongoose.Schema({
  passId: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  outTime: {
    type: Date,
    required: true
  },
  inTime: {
    type: Date,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  status:
  {
    type:String,
    default:'accepted',
    required: true
  },
  validated: {
    type: Boolean,
    default: false
  }
});

// Auto-generate passId before saving
studentGatePassSchema.pre('save', function (next) {
  if (!this.passId) {
    // Generate something like GP-20250510-abcdef1234
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniquePart = uuidv4().split('-')[0]; // Short unique ID
    this.passId = `PASSID-${datePart}-${uniquePart}`;
  }
  next();
});

const StudentGatePassModel = mongoose.model('studentgatepass', studentGatePassSchema);
module.exports = StudentGatePassModel;