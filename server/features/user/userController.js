import { ApiError } from "../../errorhelper.js";
import { validationResult, matchedData } from "express-validator";
import { service } from "./userService.js"

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
        console.log(name)
        if(name === '' || name === undefined || name === null){
            console.log('fetching user index')
            usersList = await service.getAllUsers(req.user.id);
        }else{
            usersList = await service.findMatchingUsers(name, req.user.id,limit, cursor);            
        }

        if(usersList.chunk.length === 0) return res.status(404).json({message: 'User not found'})
        
        //sanitizing data to reflect each users connection status to current user
        const sanitizedUsers= usersList.chunk.map(user=>{
            const sentConnection = user.friendSent;
            const recievedConnection = user.friendsRecieved;
            let status = 'NONE';
            sentConnection.length > 0? status = sentConnection.status : status;
            recievedConnection.length > 0?status = recievedConnection.status : status
             
            const newUser={
                id: user.id,
                name: user.name,
                photo: user.photo,
                connection: status
            }
            return newUser
        })
        console.log(sanitizedUsers)
        return res.status(200).json({
            users: sanitizedUsers,
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