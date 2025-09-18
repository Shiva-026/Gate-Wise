const exp = require('express');
const visitorApp = exp.Router();
const expressasynchandler = require('express-async-handler');
const visitorModel = require('../Models/visitorModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Add this import

visitorApp.use(exp.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

visitorApp.use('/uploads', exp.static('uploads'));


// Set upload destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');  // Make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `visitor-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });


// check the totime before pass generation
function isFutureOrCurrentDate(toTime) {
  const toDate = new Date(toTime);
  const now = new Date();
  return toDate >= now; // Compare actual datetime, not just date
}


// Generate unique visitor ID like "MLR-3049581355300"
function generateVisitorId() {
  const prefix = 'PASSID';
  const timestamp = Date.now(); // unique numeric part
  return `${prefix}-${timestamp}`;
}

// Add visitor
visitorApp.post('/add-visitor', upload.single('photo'), expressasynchandler(async (req, res) => {
  try {
  const { name, contact, reason, gender, address, uniqueId, fromTime, toTime } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !contact || !gender || !address || !uniqueId || !fromTime || !toTime) {
    return res.status(400).send({ message: 'All fields except photo are required' });
  }

  if (!isFutureOrCurrentDate(toTime)) {
    return res.status(400).send({ message: 'Cannot issue gate pass for past date/time' });
  }

  const visitorId = generateVisitorId();

  const newVisitor = new visitorModel({
    name,
    contact,
    reason,
    gender,
    address,
    uniqueId,
    visitorId,
    fromTime: new Date(fromTime),
      toTime: new Date(toTime),
    photo // ✅ Save photo filename or null
  });

  const saved = await newVisitor.save();
  res.status(201).send({
    message: 'Visitor added successfully',
    visitor: saved
  });
  } catch (error) {
    console.error('Error in add-visitor:', error);
    res.status(500).send({ message: 'Server error', error: error.message });
  }
}));

// 📌 View all visitors
visitorApp.get('/view-visitors', expressasynchandler(async (req, res) => {
  const visitors = await visitorModel.find({});
  res.status(200).send({ message: 'Visitors fetched successfully', visitors });
}));

// 📌 Update visitor using name and contact
visitorApp.put('/update-visitor', expressasynchandler(async (req, res) => {
  const { name, contact, updates } = req.body;

  if (!name || !contact || !updates) {
    return res.status(400).send({ message: 'Missing name, contact, or update data' });
  }

  const updatedVisitor = await visitorModel.findOneAndUpdate(
    { name, contact },
    updates,
    { new: true }
  );

  if (!updatedVisitor) {
    return res.status(404).send({ message: 'Visitor not found with given name and contact' });
  }

  res.status(200).send({
    message: 'Visitor updated successfully',
    visitor: updatedVisitor
  });
}));



// Generate new pass - ensure this doesn't invalidate the session
visitorApp.post('/generate-pass', upload.single('photo'), expressasynchandler(async (req, res) => {
  // Verify authentication first
  if (!req.user) { // Adjust based on your auth middleware
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const { name, contact, reason, gender, address, uniqueId, fromTime, toTime } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!name || !contact || !gender || !address || !uniqueId || !fromTime || !toTime) {
    return res.status(400).send({ message: 'All fields except photo are required' });
  }

  if (!isFutureOrCurrentDate(toTime)) {
    return res.status(400).send({ message: 'Cannot issue gate pass for past date/time' });
  }

  const visitorId = generateVisitorId();

  const newVisitor = new visitorModel({
    name,
    contact,
    reason: reason || 'Revisit',
    gender,
    address,
    uniqueId,
    visitorId,
    fromTime,
    toTime,
    photo,
    issuedBy: req.user._id // Track who issued this pass
  });

  const saved = await newVisitor.save();
  
  // Return success without affecting session
  res.status(201).send({
    message: 'New pass generated successfully',
    visitor: saved
  });
}));


module.exports = visitorApp;
