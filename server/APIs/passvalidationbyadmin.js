const exp = require('express');
const passvalidbyadmin = exp.Router();
const expressasynchandler = require('express-async-handler');
const visitorModel = require('../Models/visitorModel');
const StudentGatePassModel = require('../Models/studentGatepassModel');
const moment = require('moment-timezone');

// Helper function to convert to IST
const toIST = (date) => {
  return moment(date).tz('Asia/Kolkata').format();
};

// VALIDATING STUDENT PASSES
passvalidbyadmin.get('/validate-student-passes', expressasynchandler(async (req, res) => {
    const currentTime = new Date();
    const currentIST = toIST(currentTime);

    // Auto-update validation statuses before sending
    await StudentGatePassModel.updateMany(
        { inTime: { $lt: currentIST }, validated: true },
        { $set: { validated: false } }
    );

    // Fetch all passes with required fields
    const allPasses = await StudentGatePassModel.find({})
        .select('passId username reason outTime inTime validated');

        
    // Convert dates to IST for response
    const passesWithIST = allPasses.map(pass => ({
        ...pass._doc,
        outTime: moment(pass.outTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        inTime: moment(pass.inTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    }));

    res.status(200).send({
        message: 'Gate passes with validation status fetched',
        passes: passesWithIST
    });
}));

// VALIDATING VISITOR PASSES
passvalidbyadmin.get('/validate-visitor-passes', expressasynchandler(async (req, res) => {
    const currentTime = new Date();
    const currentIST = toIST(currentTime); // Ensure `toIST()` correctly converts to IST timezone

    // Auto-update validation status for expired passes
    await visitorModel.updateMany(
        { toTime: { $lt: currentIST }, validated: true },
        { $set: { validated: false } }
    );

    // Fetch all visitor passes
    const allVisitorPasses = await visitorModel.find({})
        .select('visitorId name reason fromTime toTime validated photo');

    // Construct response with formatted times and photo URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const visitorsWithIST = allVisitorPasses.map(visitor => ({
        visitorId: visitor.visitorId,
        name: visitor.name,
        reason: visitor.reason,
        validated: visitor.validated,
        fromTime: moment(visitor.fromTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        toTime: moment(visitor.toTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        photo: visitor.photo ? `${baseUrl}/uploads/${visitor.photo}` : null
    }));

    res.status(200).json({
        message: 'Visitor passes with validation status fetched',
        payload: visitorsWithIST
    });
}));


module.exports = passvalidbyadmin;