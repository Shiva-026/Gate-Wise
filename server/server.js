const exp = require('express');
const app = exp();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken'); // Added missing import
require('dotenv').config();
const mongoose = require('mongoose');

// Routes imports
const studentApp = require('./APIs/studentApi');
const requestPassApp = require('./APIs/requestpassApi');
const studentpassApp = require('./APIs/studentGatepassApi');
const visitorApp = require('./APIs/visitorApi');
const passvalidbyadmin = require('./APIs/passvalidationbyadmin');
const StudentModel = require('./Models/studentModel');
const adminloginApp=require('./APIs/adminloginApi')
const securityloginApp=require('./APIs/securityLoginApi')


const port = process.env.PORT || 4000;

const path = require('path');
app.use('/uploads', exp.static(path.join(__dirname, 'uploads')));

// Middleware setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://gate-wise-w11t.vercel.app',
    'https://gate-wise-pucwjeu3g-shivas-projects-abad0657.vercel.app'  // ✅ NEWLY ADDED
  ],
  credentials: true
}));



app.use(exp.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.DBURL)
  .then(() => {
    app.listen(port, () => console.log(`Server listening on port ${port}..`));
    console.log('DB connection successful');
  })
  .catch(err => console.log('DB connection error', err));

// Custom middleware


// API routes
app.use('/student-api', studentApp);
app.use('/request-api', requestPassApp);
app.use('/gatepass-api', studentpassApp);
app.use('/visitor-api', visitorApp);
app.use('/valid-admin', passvalidbyadmin);
app.use('/admin-api',adminloginApp)
app.use('/security-api',securityloginApp)


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "error", error: err.message });
});

