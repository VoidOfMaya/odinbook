import { service } from "./networkService"


const getMyFriends = async(req, res, next)=>{

    try{
        //get active friendships for user
        const friendsList = await  service.getFriends(req.user.id);
        return res.status(200).json({friends: friendsList})
    }catch(err){
        next(err)
    }

}
const getPendingRequests = async(req, res, next)=>{

    try{
        //get active friendships for user
        const friendsList = await  service.getRequests(req.user.id);
        return res.status(200).json({friends: friendsList})
    }catch(err){
        next(err)
    }

}
export const controller = {
    getMyFriends,
    getPendingRequests
}