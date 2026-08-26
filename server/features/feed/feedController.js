import { validationResult, matchedData } from "express-validator"
import { service } from './feedService.js'
import { service as networkService } from "../network/networkService.js";
const getFeed = async( req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id, limit, cursor}= matchedData(req);

    try{ 
        //get an array of connections user has where statuse is active
        const connections = await networkService.getConnections(id, "ACTIVE");
        if(!connections)throw new ApiError(500, "Could retrieve conenctions");
        //extract user ids from connection data
        const friendsIdArray = connections.map(connection => connection.user.id);
        // get posts by connecitons array id
        const feed = await service.getfeed(friendsIdArray, limit, cursor);
        if(!feed)throw new ApiError(500, "Could not find comments");
        console.log(feed)
        // get offset value for next comment chunk
        res.status(200)
        .json({feed: feed.chunk, nextCursor: feed.nextCursor.id || null})
    }catch(err){
        next(err)
    }
}

const controller = {
    getFeed,
}
export{
    controller
}