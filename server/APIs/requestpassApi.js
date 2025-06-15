const exp = require('express');
const requestPassApp = exp.Router();
const expressAsyncHandler = require('express-async-handler');
const RequestPassModel = require('../Models/requestpassModel');
const moment = require('moment-timezone');

requestPassApp.use(exp.json());

// Helper function to convert to IST
const toIST = (date) => {
  return moment(date).tz('Asia/Kolkata').format();
};

//req for a pass by student
requestPassApp.post('/request-pass', expressAsyncHandler(async (req, res) => {
    const data = req.body;

    // Convert incoming dates to IST
    data.fromTime = toIST(data.fromTime);
    data.toTime = toIST(data.toTime);
    data.requestedon = toIST(new Date()); // Add current timestamp in IST

    // Check if toTime is in the past
    const nowIST = moment().tz('Asia/Kolkata');
    const toTimeIST = moment(data.toTime).tz('Asia/Kolkata');
    if (toTimeIST.isBefore(nowIST)) {
        return res.status(400).send({ message: 'Cannot request a pass for a time that has already passed.' });
    }

    const newRequest = new RequestPassModel(data);
    const result = await newRequest.save();

    res.status(201).send({
        message: 'Pass request submitted',
        payload: {
            ...result._doc,
            fromTime: moment(result.fromTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
            toTime: moment(result.toTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
            requestedon: moment(result.requestedon).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        }
    });
}));


// View all requested passes (with IST formatting)
requestPassApp.get('/all-req-passes', expressAsyncHandler(async (req, res) => {
    const requestedPasses = await RequestPassModel.find()
      .select('username reason fromTime toTime requestedon status');
    
    // Convert all dates to IST before sending
    const passesWithIST = requestedPasses.map(pass => ({
      ...pass._doc,
      fromTime: moment(pass.fromTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
      toTime: moment(pass.toTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
      requestedon: moment(pass.requestedon).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    }));
    
    res.status(200).send({
      message: "Filtered request passes",
      payload: passesWithIST
    });
}));

// Pass rejected by admin (with IST time handling)
requestPassApp.post('/reject-request', expressAsyncHandler(async (req, res) => {
  const { username, fromTime, toTime, reason } = req.body;

  if (!username || !fromTime || !toTime || !reason) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  // Convert incoming times to IST for accurate comparison
  const fromIST = moment(fromTime).tz('Asia/Kolkata').toDate();
  const toIST = moment(toTime).tz('Asia/Kolkata').toDate();

  const request = await RequestPassModel.findOneAndUpdate(
    {
      username,
      reason,
      fromTime: fromIST,
      toTime: toIST,
      status: 'pending'
    },
    { status: 'rejected' },
    { new: true }
  );

  if (!request) {
    return res.status(404).send({
      message: 'No pending request found to reject'
    });
  }

  // Format response dates in IST
  const formattedRequest = {
    ...request._doc,
    fromTime: moment(request.fromTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
    toTime: moment(request.toTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
  };

  res.status(200).send({
    message: 'Request rejected successfully',
    request: formattedRequest
  });
}));

module.exports = requestPassApp;