import { service } from "./networkService"
import { validationResult,matchedData } from "express-validator";


const getConnections = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {status} = matchedData(req);
    try{
        //get active friendships for user
        const friendsList = await  service.getConnections(req.user.id, status);
        return res.status(200).json({friends: friendsList})
    }catch(err){
        next(err)
    }

}/*
const getPendingRequests = async(req, res, next)=>{

    try{
        //get active friendships for user
        const friendsList = await  service.getRequests(req.user.id);
        return res.status(200).json({friends: friendsList})
    }catch(err){
        next(err)
    }

}
*/
export const controller = {
    getConnections,
}