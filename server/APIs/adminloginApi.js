const express = require('express');
const adminloginApp = express.Router();
const bcryptjs = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler');
const adminModel = require('../Models/adminModel');
const jwt = require('jsonwebtoken');

adminloginApp.use(express.json());

// ✅ Step 1: Predefined admin credentials
const PREDEFINED_ADMIN = {
  username: "admin",
  password: "admin@123" // change this in production to use process.env
};

// ✅ Step 2: LOGIN API
adminloginApp.post('/admin', expressAsyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // First, check DB
  const userObj = await adminModel.findOne({ username });

  if (userObj) {
    const isMatch = await bcryptjs.compare(password, userObj.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'invalid password' });
    }

    const signedToken = jwt.sign({ username: userObj.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.send({ message: 'login successful', payload: userObj, token: signedToken });
  }

  // Fallback to predefined admin
  if (username === PREDEFINED_ADMIN.username && password === PREDEFINED_ADMIN.password) {
    const signedToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.send({
      message: 'login successful',
      payload: { username, role: 'admin', source: 'predefined' },
      token: signedToken
    });
  }

  return res.status(404).send({ message: 'invalid username' });
}));

// ✅ Step 3: FORGOT PASSWORD (if first time, create admin in DB)
adminloginApp.post('/forgot-password', expressAsyncHandler(async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const user = await adminModel.findOne({ username });

  // If admin already in DB
  if (user) {
    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Old password is incorrect' });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 6);
    user.password = hashedNewPassword;
    await user.save();
    return res.send({ message: 'Password updated successfully' });
  }

  // If admin not in DB → validate against predefined
  if (username === PREDEFINED_ADMIN.username && oldPassword === PREDEFINED_ADMIN.password) {
    const hashedNewPassword = await bcryptjs.hash(newPassword, 6);
    const newAdmin = new adminModel({ username, password: hashedNewPassword });
    await newAdmin.save();
    return res.send({ message: 'Admin password updated and saved in DB' });
  }

  return res.status(404).send({ message: 'Invalid username or old password' });
}));

module.exports = adminloginApp;
