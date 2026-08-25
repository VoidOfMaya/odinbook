import { Router } from "express";
import { validate } from "./postValidation";
import { controller } from "./postController";
import { debug, isUserAuthor } from "./postMiddleware";
import { commentRouter } from "../comment/commentRouter.js";

const postRouter = Router();

postRouter.get('/',async(req, res)=>{
    res.sendStatus(200);

});
//only auuthenticated usersa 
postRouter.post('/',validate.content,controller.createPost);
postRouter.get('/:id',validate.postId,controller.getPost);
postRouter.patch('/:id/like',validate.postId, controller.like);
postRouter.patch('/:id/dislike',validate.postId, controller.dislike);
// only post authors
postRouter.patch('/:id',validate.postEdit,isUserAuthor,controller.editPost);
postRouter.delete('/:id',validate.postId,isUserAuthor,controller.deletePost);
//Nested routes!
postRouter.use('/:id/comment',validate.postId, commentRouter);


export{
    postRouter
}