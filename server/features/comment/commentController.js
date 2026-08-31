import { validationResult, matchedData } from "express-validator"
import { ApiError } from "../../errorhelper.js";
import { service } from "./commentService.js";

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
    const {content}= matchedData(req);
    const postId = req.params.id

    try{
        const newComment = await service.createComment(req.user.id, postId, content);
        if(!newComment) throw new ApiError(500, "Could not create comment");
        res.status(201).json({message: "comment created", comment: newComment})
    }catch(err){
        next(err)
    }
}
const editComment =async(req, res, next)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id ,content}= matchedData(req);
    try{
        const comment = await service.editComment(id, content);
        if(!content)throw new ApiError(500, "Could not update comment");
        res.status(200).json({message: "Comment edited successfully", comment: comment})
    }catch(err){
        next(err)
    }
}
const deleteComment=async(req, res, next)=>{
        
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id}= matchedData(req);
    try{
        const comment = await service.deleteComment(id);
        if(!comment) throw new ApiError(500, "Could not delete comment")
        res.status(200).json({message: 'Comment deleted successfully'})
    }catch(err){
        next(err)
    }
}
const likeComment = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id}= matchedData(req);

    try{
        const comment = await service.likeComment(id);
        if(!comment) throw new ApiError(500, " could not like comment");
        res.status(200).json({message: 'comment liked!'})
        
    }catch(err){
        next(err)
    }
}
const dislikeComment = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id}= matchedData(req);
    try{
        const comment = await service.dislikeComment(id);
        if(!comment) throw new ApiError(500, " could not like comment");
        res.status(200).json({message: 'comment disliked!'})
        
    }catch(err){
        next(err)
    }
}

const controller = {
    getComments,
    createComment,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment
}
export{
    controller
}