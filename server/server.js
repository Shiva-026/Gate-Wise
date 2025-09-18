const exp = require('express');
const app = exp();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Routes imports
const studentApp = require('./APIs/studentApi');
const requestPassApp = require('./APIs/requestpassApi');
const studentpassApp = require('./APIs/studentGatepassApi');
const visitorApp = require('./APIs/visitorApi');
const passvalidbyadmin = require('./APIs/passvalidationbyadmin');
const adminloginApp = require('./APIs/adminloginApi');
const securityloginApp = require('./APIs/securityLoginApi');
const verifyToken = require('./middlewares/verifyToken');

const port = process.env.PORT || 4000;

// ✅ Serve uploaded files
app.use('/uploads', exp.static(path.join(__dirname, 'uploads')));

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",   // local frontend
  "https://gate-wise-w11t-wpkmw43mt-shivas-projects-abad0657.vercel.app",
  "https://gate-wise-w11t.vercel.app" // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(exp.json());
app.use(cookieParser());

// ✅ Database connection
mongoose.connect(process.env.DBURL)
  .then(() => {
    app.listen(port, () =>
      console.log(`✅ Server listening on port ${port}..`)
    );
    console.log('✅ DB connection successful');
  })
  .catch(err => console.log('❌ DB connection error', err));

// ✅ API routes (only relative paths!)
app.use('/student-api', studentApp);
app.use('/request-api', verifyToken, requestPassApp);
app.use('/gatepass-api', verifyToken, studentpassApp);
app.use('/visitor-api', verifyToken, visitorApp);
app.use('/valid-admin', verifyToken, passvalidbyadmin);
app.use('/admin-api', adminloginApp);
app.use('/security-api', securityloginApp);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "error", error: err.message });
});
