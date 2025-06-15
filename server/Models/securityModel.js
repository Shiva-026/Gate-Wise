const mongoose=require('mongoose');

const securitySchema=new mongoose.Schema({
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

const securityModel=mongoose.model('security',securitySchema);
//export
module.exports=securityModel;