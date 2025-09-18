const express = require('express');
const securityloginApp = express.Router();
const bcryptjs = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler');
const securityModel = require('../Models/securityModel');
const jwt = require('jsonwebtoken');

securityloginApp.use(express.json());

// ✅ Predefined Security Credentials
const PREDEFINED_SECURITY = {
  username: "security",
  password: "security@123"
};

// ✅ SECURITY LOGIN API
securityloginApp.post('/security', expressAsyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const userObj = await securityModel.findOne({ username });

  if (userObj) {
    const isMatch = await bcryptjs.compare(password, userObj.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'invalid password' });
    }

    const signedToken = jwt.sign({ username: userObj.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.send({ message: 'login successful', payload: userObj, token: signedToken });
  }
  else {
    return res.status(404).send({ message: 'invalid username' });
  }

  // Predefined fallback
  if (username === PREDEFINED_SECURITY.username && password === PREDEFINED_SECURITY.password) {
    const signedToken = jwt.sign({ username }, 'shivakar', { expiresIn: '1h' });
    return res.send({
      message: 'login successful',
      payload: { username, role: 'security', source: 'predefined' },
      token: signedToken
    });
  }

  return res.status(404).send({ message: 'invalid password' });
}));

// ✅ SECURITY FORGOT PASSWORD
securityloginApp.post('/forgot-password', expressAsyncHandler(async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const user = await securityModel.findOne({ username });

  // Already in DB → update
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

  // Not in DB → verify fallback
  if (username === PREDEFINED_SECURITY.username && oldPassword === PREDEFINED_SECURITY.password) {
    const hashedNewPassword = await bcryptjs.hash(newPassword, 6);
    const newSecurity = new securityModel({ username, password: hashedNewPassword });
    await newSecurity.save();
    return res.send({ message: 'Security password updated and saved in DB' });
  }

  return res.status(404).send({ message: 'Invalid username or old password' });
}));

module.exports = securityloginApp;
