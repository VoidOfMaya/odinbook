import { service } from "./networkService"
import { validationResult,matchedData } from "express-validator";
import { ApiError } from "../../errorhelper";

const getConnections = async( req, res, next)=>{
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

}
const updateConnection =async ( req, res, next)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {connectionId, updateStatus} = matchedData(req);
    try{
        //get active friendships for user
        const updateConnection = await  service.updateConnection(connectionId, updateStatus)
        return res.status(200).json({message: 'Connection statuse updated!'})
    }catch(err){
        next(err)
    }

}
const createConnection =async( req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {recipiantId} = matchedData(req);
    try{
        //get active friendships for user
        const newConnection = await  service.createConnection(req.user.id, recipiantId)
        console.log(newConnection)
        if(!newConnection) throw new Error('no Records Founds')
        return res.status(201).json({connectionId: newConnection.id})
    }catch(err){
        next(err)
    }

}
/*
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
const controller = {
    getConnections,
    updateConnection,
    createConnection
}
export {
    controller
}