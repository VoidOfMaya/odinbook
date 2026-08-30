import { Router } from "express";
import { validate } from "./commentValidation.js";
import { controller} from "./commentController.js"
import { debug, isUserAuthor } from "./commentMiddleware.js";
const commentRouter = Router({mergeParams: true});


//Post nested Endpoints
commentRouter.get('/list',validate.limit,validate.cursor,controller.getComments)//get comments 
commentRouter.post('/new',validate.newComment,controller.createComment)//post a new comment on parent post

// Standalone Endpoints
//authenticated users only
commentRouter.get('/', async(req, res)=>{res.sendStatus(200)})
commentRouter.patch('/:id/like',validate.id, controller.likeComment)
commentRouter.patch('/:id/dislike',validate.id, controller.dislikeComment)

//comment authors only
commentRouter.patch('/:id',validate.id,validate.comment,isUserAuthor,controller.editComment)//validate ownership of comment
commentRouter.delete('/:id',validate.id,isUserAuthor, controller.deleteComment)//delete comment where user is comment author





export {
    commentRouter
}