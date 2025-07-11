const mongoose=require('mongoose');

const adminSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:
    {
        type:String,
        required:true
    },
    
},{"strict":"throw"})

const adminModel=mongoose.model('admin',adminSchema);
//export
module.exports=adminModel;