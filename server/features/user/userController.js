import { ApiError } from "../../errorhelper.js";
import { validationResult, matchedData } from "express-validator";
import { service } from "./userService.js"
import {cloudUpload} from '../photo/cloudinary.js'
import { json } from "express";

const getMe = async(req, res, next)=>{

    //{id, name, bio. photo, isOnline,lastOnline, createdAt}
    try{
        const userData = await service.getUser(req.user.id);
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
    //cloudinary
    let result = null;
    if(req.file){
        //handle posts with photo
        result = await cloudUpload(req.file.buffer);
        //checks if cloudinary  returned the correct objects
        if(!result.secure_url){ 
            throw new Error('errors','internal Error: cloudinary url faulty, try again later!' )
        }       
        const userUpdate = await service.updateMyData(req.user.id, data, result.secure_url)//takes userId, content,  photo
        console.log(userUpdate)
        return res.status(200).json({
            message: 'Profile updated successfully', 
            userData: userUpdate
        })
    }else{
        //handle post without photo
        const userUpdate = await service.updateMyData(req.user.id, data)//takes userId, content,  photo=null
        console.log(userUpdate)
        return res.status(200).json({
            message: 'Profile updated successfully', 
            userData: userUpdate
        })
    }
    //missing photo parameter * add when multer implementation ready!
    //await service.updateMyData(req.user.id,data)
    //return res.status(200).json({message: 'Profile updated successfully'});
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
        console.log('accessing user data')
        // validate if user is private
        
        const userData = await service.getUser(data.id);
        return res.status(200).json({user: userData});     
    }catch(err){
        next(err);
    }
}
const searchUsers = async(req, res, next)=>{
    //validation handler
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const {name,limit, cursor} = matchedData(req);  
    let usersList;
    try{
        if(!name){
            return res.status(200).json({
                message: "no search value provided"
                })
        }
        usersList = await service.findMatchingUsers(name, req.user.id,limit, cursor);            
        if(usersList.chunk.length === 0) return res.status(404).json({message: 'User not found'})
        
        //sanitizing data to reflect each users connection status to current user
        const sanitizedUsers= usersList.chunk.map(user=>{
            const sentConnection = user.friendSent;
            const recievedConnection = user.friendsRecieved;
            let status = 'NONE';
            //connection variables are arrays of object, at most containing 1 object for status
            //access status content through the connection var arrays zero'th index
            sentConnection.length > 0? status = sentConnection[0].status : status;
            recievedConnection.length > 0?status = recievedConnection[0].status : status
             
            const sanUser ={  //edited user data
                id: user.id,
                name: user.name,
                photo: user.photo,
                isPrivate: user.isPrivate,
                connection: status
            }
            return sanUser
        })
        return res.status(200).json({
            data: sanitizedUsers,
            nextCursor: usersList.nextCursor !== null
                ? usersList.nextCursor.id
                : null
        })
    }catch(err){
        next(err);
    }
}
const controller ={
    getMe,
    updateProfile,
    getUser,
    searchUsers,

}
export{
    controller
}