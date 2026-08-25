import { Router } from "express";
import { validate } from "./commentValidation.js";
import { controller} from "./commentController.js"
import { debug, isUserAuthor } from "./commentMiddleware.js";
const commentRouter = Router({mergeParams: true});
//authenticated users only
commentRouter.get('/', async(req, res)=>{res.sendStatus(200)})
commentRouter.get('/commentlist',validate.limit,validate.cursor,controller.getComments)//get comments 
commentRouter.post('/newComment',validate.newComment,controller.createComment)//post a new comment on parent post
//commentRouter.patch('/:id/like')
//commentRouter.patch('/:id/dislike')

//comment authors only
commentRouter.patch('/:id',validate.id,validate.comment,isUserAuthor,controller.editComment)//validate ownership of comment
commentRouter.delete('/:id',validate.id,isUserAuthor, controller.deleteComment)//delete comment where user is comment author





export {
    commentRouter
}