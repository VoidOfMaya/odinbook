import { ApiError } from "../../errorhelper";
import { validationResult, matchedData } from "express-validator";
import { service } from "./userService"

const getMe = async(req, res, next)=>{

    //{id, name, bio. photo, isOnline,lastOnline, createdAt}
    try{
        const userData = await service.getMyData(req.user.id);
        return res.status(200).json({user: userData});     
    }catch(err){
        next(err);
    }

}
const updateProfile = async(req, res, next)=>{
    //validation handler
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors : errors.array()})
    const data = matchedData(req);  
   
   //logic
   try{
    //missing photo parameter * add when multer implementation ready!
    await service.updateMyData(req.user.id,data)
    return res.status(200).json({message: 'Profile updated successfully'});
   }catch(err){
    next(err)
   }
}
const getUser = async(req,res, next)=>{
    //validation handler
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors : errors.array()})
    const data = matchedData(req);  
   
    try{
        // validate if user is private
        
        const userData = await service.getMyData(data.id);
        return res.status(200).json({user: userData});     
    }catch(err){
        next(err);
    }
}

const controller ={
    getMe,
    updateProfile,
    getUser

}
export{
    controller
}