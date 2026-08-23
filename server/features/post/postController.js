import { validationResult, matchedData } from "express-validator";
import { service } from "./postService";
import { ApiError } from "../../errorhelper";
const getPost = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const data = matchedData(req);
    try{
        const post = await service.getPost(data.id);
        if(!post) throw new ApiError(404, 'Could not find post');
        return res.status(200).json({post: post});
    }catch(err){
        next(err);
    } 
}
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
const deletePost = async( req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id} = matchedData(req); 
    try{
        const post = await service.deletePost(id);
        if(!post) throw new ApiError(404, 'Could not find post')
        res.status(200).json({message: 'Post Deleted', post: post})
    }catch(err){
        next(err)
    }
}
const like = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id} = matchedData(req); 
    try{
        const like = await service.like(id);
        if(!like) throw new ApiError(500, 'Could not like post')
        res.status(200).json({message: "Post Liked", likeCount: like.likes})
    }catch(err){
        next(err)
    }
}
const dislike = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const {id} = matchedData(req); 
    try{
        const like = await service.dislike(id);
        if(!like) throw new ApiError(500, 'Could not dislike post')
        res.status(200).json({message: "Post Disliked", likeCount: like.likes})
    }catch(err){
        next(err)
    }
       
}
const controller ={
    getPost,
    createPost,
    editPost,
    like,
    dislike,
    deletePost,
}
export{
    controller
}