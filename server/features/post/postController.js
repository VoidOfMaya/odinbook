import { validationResult, matchedData } from "express-validator";
import { service } from "./postService";
const createPost = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const data = matchedData(req);
    try{
        const post = await service.newPost(req.user.id, data.content)//takes userId, content,  photo=null
        res.status(201).json({message: "post created!"})
    }catch(err){
        next(err);
    }
}
const editPost = async (req, res, next)=>{
    //insert edit logic here
    res.sendStatus(403)
}
const controller ={
    createPost,
    editPost,
}
export{
    controller
}