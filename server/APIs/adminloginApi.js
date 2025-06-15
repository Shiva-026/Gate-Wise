const exp=require('express');
const adminloginApp=exp.Router();
const bcryptjs=require('bcryptjs');
const expressasynchandler=require('express-async-handler');
const adminModel=require('../Models/adminModel')
adminloginApp.use(exp.json())
const jwt = require('jsonwebtoken'); // Add this import

//APIs
adminloginApp.post('/admin',expressasynchandler(async(req,res)=>
    {
        let userCred=req.body;
        //role check
       
        let userObj=await adminModel.findOne({username:userCred.username})
    
    
        if(userObj===null)
        {
            return res.send({message:"invaild username"})
        }
            //password checkking
            else
            {
    
                    const result=await bcryptjs.compare(userCred.password,userObj.password)
                    if(result===false)
                    {
                        return res.send({message:'invalid password'})
                    }
                    else
                    {
                        let signedToken = jwt.sign({ username: userObj.username }, 'shivakar', { expiresIn: '1h' })
                                   return res.send({ message: 'login successful', payload: userObj, token: signedToken })
    
                        //return res.send({message:'login successful',payload:userObj})
                    }
            }
    
        }
        
    ))

// adminloginApp.post('/add',expressasynchandler(async(req,res)=>
// {
// let secdata = req.body;
//     //password hashing
//     let hassedpass = await bcryptjs.hash(secdata.password, 6);
//     secdata.password = hassedpass;
//     //doc creation
//     let secdoc = new adminModel(secdata);
//     const sec = await secdoc.save();
//     res.status(201).send({ message: "user created", payload: sec })
// }))



module.exports=adminloginApp;