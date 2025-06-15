const exp = require('express');
const studentApp = exp.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const expressasynchandler = require('express-async-handler');
const StudentModel = require('../Models/studentModel');
const requestPassApp = require('./requestpassApi');
const studentpassApp = require('./studentGatepassApi');
const RequestPassModel = require('../Models/requestpassModel');
const StudentGatePassModel = require('../Models/studentGatepassModel');
studentApp.use(exp.json());

// Helper function to get current IST time
const getCurrentIST = () => {
    const now = new Date();
    // IST is UTC+5:30
    const ISTOffset = 330 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    return new Date(now.getTime() + ISTOffset);
};

// 🔁 Validate gate passes before sending personal passes
const validateGatePasses = async () => {
    const currentIST = getCurrentIST();

    try {
        const result = await StudentGatePassModel.updateMany(
            { inTime: { $lt: currentIST }, validated: true },
            { $set: { validated: false } }
        );
        console.log(`[VALIDATION] Updated ${result.modifiedCount} expired gate passes`);
    } catch (error) {
        console.error('Gate pass validation error:', error);
    }
};

// Add student
studentApp.post('/student', expressasynchandler(async (req, res) => {
    let studentdata = req.body;
    //password hashing
    let hassedpass = await bcryptjs.hash(studentdata.password, 6);
    studentdata.password = hassedpass;
    //doc creation
    let studentdoc = new StudentModel(studentdata);
    const stu = await studentdoc.save();
    res.status(201).send({ message: "user created", payload: stu })
}))

// Student login 
studentApp.post('/login', expressasynchandler(async (req, res) => {
    let studentCred = req.body;
    //username check
    let studentObj = await StudentModel.findOne({ username: studentCred.username })
    if (studentObj === null) {
        return res.send({ message: 'invalid username' })
    }
    //password checking
    else {
        const result = await bcryptjs.compare(studentCred.password, studentObj.password)
        if (result === false) {
            return res.send({ message: 'invalid password' })
        }
        else {
            let signedToken = jwt.sign({ username: studentObj.username }, 'shivakar', { expiresIn: '1h' })
            return res.send({ message: 'login successful', payload: studentObj, token: signedToken })
        }
    }
}))

// View all students
studentApp.get('/all-students', expressasynchandler(async (req, res) => {
    let studentslist = await StudentModel.find();
    res.status(200).send({ message: "all students", payload: studentslist })
}))

// Delete a particular student
studentApp.delete('/delete/:username', expressasynchandler(async (req, res) => {
    const { username } = req.params;

    const result = await StudentModel.findOneAndDelete({ username });

    if (!result) {
        return res.status(404).send({ message: 'Student not found' });
    }

    res.status(200).send({ message: 'Student deleted successfully', deleted: result });
}));

// Search student by roll number
studentApp.get('/search', expressasynchandler(async (req, res) => {
    const { rollno } = req.query;
    
    if (!rollno) {
        return res.status(400).send({ message: 'Roll number is required' });
    }

    const student = await StudentModel.findOne({ rollno });
    
    if (!student) {
        return res.status(404).send({ message: 'Student not found' });
    }

    res.status(200).send(student);
}));

// UPDATE student details by username
studentApp.put('/update/:username', expressasynchandler(async (req, res) => {
    const { username } = req.params;
    const updateData = req.body;

    const updatedStudent = await StudentModel.findOneAndUpdate(
        { username },
        updateData,
        { new: true }
    );

    if (!updatedStudent) {
        return res.status(404).send({ message: 'Student not found' });
    }

    res.status(200).send({ message: 'Student updated successfully', student: updatedStudent });
}));

// Personal passes API (pending/rejected + accepted)
studentApp.get('/personal-passes/:student', expressasynchandler(async (req, res) => {
    const username = req.params.student;

    await validateGatePasses();  // ✅ Validate before fetching

    // ✅ Get pending/rejected request passes
    const requestPasses = await RequestPassModel.find(
        { username, status: { $in: ['pending', 'rejected'] } }
    ).select('username reason fromTime toTime status requestedOn');

    // ✅ Get accepted gate passes (with updated validated field)
    const gatePasses = await StudentGatePassModel.find(
        { username }
    ).select('passId username reason outTime inTime status issuedAt validated');

    // Convert UTC times to IST for response
    const convertToIST = (date) => {
        if (!date) return null;
        const ISTOffset = 330 * 60 * 1000;
        return new Date(date.getTime() + ISTOffset);
    };

    const formattedRequestPasses = requestPasses.map(pass => ({
        ...pass._doc,
        fromTime: convertToIST(pass.fromTime),
        toTime: convertToIST(pass.toTime),
        requestedOn: convertToIST(pass.requestedOn)
    }));

    const formattedGatePasses = gatePasses.map(pass => ({
        ...pass._doc,
        outTime: convertToIST(pass.outTime),
        inTime: convertToIST(pass.inTime),
        issuedAt: convertToIST(pass.issuedAt)
    }));

    const combinedPasses = {
        requestPasses: formattedRequestPasses,
        gatePasses: formattedGatePasses
    };

    res.status(200).send({
        message: 'Personal passes fetched successfully',
        passes: combinedPasses
    });
}));

module.exports = studentApp;