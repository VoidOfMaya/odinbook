import { validationResult, matchedData } from "express-validator";
import { service } from "./postService";
import { ApiError } from "../../errorhelper";
const createPost = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const data = matchedData(req);
    try{
        const post = await service.newPost(req.user.id, data.content)//takes userId, content,  photo=null
        return res.status(201).json({message: "post created!", post: post})
    }catch(err){
        next(err);
    }
}
const editPost = async (req, res, next)=>{
    //validate input
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id, content} = matchedData(req);
    try{
        const post = await service.updatePost(id, content);
        if(!post) throw new ApiError(404, "post not found");
        return res.status(200).json({message:"Post Updated!", post: post})
    }catch(err){
        next(err)
    }

}
const controller ={
    createPost,
    editPost,
}
export{
    controller
}