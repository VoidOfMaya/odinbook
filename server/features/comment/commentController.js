import { validationResult, matchedData } from "express-validator"
import { ApiError } from "../../errorhelper";
import { service } from "./commentService";

const getComments = async(req, res, next)=>{
    
    console.log(req.params)
    const postId = (req.params.id);
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors.array())
        throw new ApiError(400,"validation Error",errors.array())
    }
    const {limit, cursor} = matchedData(req); 
    try{
        //if limit is not available get only 1 comment
        const postComments = await service.getComments(postId, limit, cursor);
        if(!postComments)throw new ApiError(500, "Could not find comments");
        // get offset value for next comment chunk
        res.status(200)
        .json({comments: postComments.chunk, nextCursor: postComments.nextCursor.id})
    }catch(err){
        next(err)
    }
}
//takes user id post id and content
const createComment =async(req, res, next)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {comment}= matchedData(req);
    const postId = req.params.id

    try{
        const newComment = await service.createComment(req.user.id, postId, comment);
        if(!newComment) throw new ApiError(500, "Could not create comment");
        res.status(201).json({message: "comment created", comment: newComment})
    }catch(err){
        next(err)
    }
}

const controller = {
    getComments,
    createComment,
}
export{
    controller
}