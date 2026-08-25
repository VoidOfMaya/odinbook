import { Router } from "express";
import { validate } from "./commentValidation.js";
import { controller} from "./commentController.js"
import { debug } from "./commentMiddleware.js";
const commentRouter = Router({mergeParams: true});
//consider adding a limiter to define how miuch comments to get!
commentRouter.get('/', async(req, res)=>{res.sendStatus(200)})
commentRouter.get('/commentlist',validate.limit,validate.cursor,controller.getComments)//get comments 
commentRouter.post('/newComment',validate.newComment,controller.createComment)//post a new comment on parent post

//commentRouter.patch('/')//edit comment if user is comment author!
//commentRouter.delete('/')//delete comment where user is comment author

//commentRouter.patch('/like')
//commentRouter.patch('/dislike')



export {
    commentRouter
}