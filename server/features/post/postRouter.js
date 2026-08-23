import { Router } from "express";
import { validate } from "./postValidation";
import { controller } from "./postController";
import { isUserAuthor } from "./postMiddleware";
const postRouter = Router();

postRouter.get('/',async(req, res)=>{
    res.sendStatus(200);

});
postRouter.post('/',validate.content,controller.createPost)
postRouter.get('/:id',validate.postId,controller.getPost)
postRouter.patch('/:id',validate.postEdit,isUserAuthor,controller.editPost)
postRouter.patch('/:id/like',validate.postId, controller.like)
postRouter.patch('/:id/dislike',validate.postId, controller.dislike)



export{
    postRouter
}