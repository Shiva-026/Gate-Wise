const mongoose=require('mongoose');

const studentSchema= new mongoose.Schema({
    name:
    {
        type:String,
        required:true,
    },
    dob:
    {
        type:Date,
        required:true,
    },
    department:
    {
        type:String,
        required:true,
    },
    rollno:
    {
        type:String,
        required:true,
    },
    gender:
    {
        type:String,
        enum: ['Male', 'Female', 'Other'],
        required:true,
    },
    contact:
    {
        type:String,
        required:true,
    },
    username:
    {
        type:String,
        required:true,
        unique:true
    },
    password:
    {
        type:String,
        required:true,
    }
    
},{"strict":"throw"})



//model creation
const StudentModel=mongoose.model('student',studentSchema);

//export
module.exports=StudentModel;