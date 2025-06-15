const exp = require('express');
const expressAsyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const StudentGatePassModel = require('../Models/studentGatepassModel');
const RequestPassModel = require('../Models/requestpassModel');
const moment = require('moment-timezone');

const studentpassApp = exp.Router();
studentpassApp.use(exp.json());

// Helper function to convert to IST
const toIST = (date) => {
  return moment(date).tz('Asia/Kolkata').format();
};

// Check if date is in future (IST)
function isFutureOrCurrentDate(toTime) {
    const nowIST = moment().tz('Asia/Kolkata');
    const toDateIST = moment(toTime).tz('Asia/Kolkata');
    return toDateIST.isSameOrAfter(nowIST);
}

// Direct gate pass generation
studentpassApp.post('/generate-direct-gatepass', expressAsyncHandler(async (req, res) => {
    const { username, reason, fromTime, toTime } = req.body;

    // Convert to IST
    const fromTimeIST = toIST(fromTime);
    const toTimeIST = toIST(toTime);

    // Check if toTime is in the past
    if (!isFutureOrCurrentDate(toTimeIST)) {
        return res.status(400).send({ message: 'Cannot issue gate pass for past date/time' });
    }

    const datePart = moment().tz('Asia/Kolkata').format('YYYYMMDD');
    const uniquePart = uuidv4().split('-')[0];
    const passId = `PASSID-${datePart}-${uniquePart}`;

    const newPass = new StudentGatePassModel({
        passId,
        username,
        reason,
        outTime: fromTimeIST,
        inTime: toTimeIST,
        issuedAt: toIST(new Date()),
        validated: true
    });

    await newPass.save();
    
    // Format response dates in IST
    const formattedPass = {
        ...newPass._doc,
        outTime: moment(newPass.outTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        inTime: moment(newPass.inTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        issuedAt: moment(newPass.issuedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    };

    res.status(201).send({ 
        message: 'Gate pass issued directly', 
        pass: formattedPass 
    });
}));

    // Approve a request and generate gate pass
studentpassApp.post('/generate-gatepass', expressAsyncHandler(async (req, res) => {
    const { username, reason, fromTime, toTime } = req.body;

    if (!username || !reason || !fromTime || !toTime) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    // Convert to IST
    const fromTimeIST = toIST(fromTime);
    const toTimeIST = toIST(toTime);

    // Check if toTime is in the past
    if (!isFutureOrCurrentDate(toTimeIST)) {
        return res.status(400).send({ message: 'Cannot issue gate pass for past date/time' });
    }

    const existingRequest = await RequestPassModel.findOne({
        username,
        reason,
        fromTime: fromTimeIST,
        toTime: toTimeIST,
        status: 'pending'
    });

    if (!existingRequest) {
        return res.status(404).send({
            message: 'No matching pending request found, or request is already approved'
        });
    }

    const datePart = moment().tz('Asia/Kolkata').format('YYYYMMDD');
    const uniquePart = uuidv4().split('-')[0];
    const passId = `PASSID-${datePart}-${uniquePart}`;

    const newPass = new StudentGatePassModel({
        passId,
        username,
        reason,
        outTime: fromTimeIST,
        inTime: toTimeIST,
        issuedAt: toIST(new Date()),
        validated: true
    });

    await newPass.save();
    await RequestPassModel.findByIdAndUpdate(existingRequest._id, { status: 'accepted' });

    // Format response dates in IST
    const formattedPass = {
        ...newPass._doc,
        outTime: moment(newPass.outTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        inTime: moment(newPass.inTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        issuedAt: moment(newPass.issuedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    };

        res.status(201).send({
            message: 'Gate pass generated and request marked as accepted',
            pass: formattedPass
        });
    }));


module.exports = studentpassApp;
