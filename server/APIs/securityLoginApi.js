    const exp=require('express')
    const securityloginApp=exp.Router();
    const bcryptjs=require('bcryptjs');
    const expressasynchandler=require('express-async-handler');
    const securityModel=require('../Models/securityModel')
    securityloginApp.use(exp.json())
    const jwt = require('jsonwebtoken'); // Add this import

    //APIs
    securityloginApp.post('/security',expressasynchandler(async(req,res)=>
        {
            let userCred=req.body;
            //role check
        
            let userObj=await securityModel.findOne({username:userCred.username})
        
        
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


    // securityloginApp.post('/add',expressasynchandler(async(req,res)=>
    // {
    // let secdata = req.body;
    //     //password hashing
    //     let hassedpass = await bcryptjs.hash(secdata.password, 6);
    //     secdata.password = hassedpass;
    //     //doc creation
    //     let secdoc = new securityModel(secdata);
    //     const sec = await secdoc.save();
    //     res.status(201).send({ message: "user created", payload: sec })
    // }))

    module.exports=securityloginApp;