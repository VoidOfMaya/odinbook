import { Router } from "express";
import { controller } from "./userController";
import { validate } from "./userValidation";
import { checkUserVisibility } from "./userMiddleware";

const userRouter = Router();

userRouter.get('/',async(req, res)=>{
    return res.status(200).json({message: 'route accessed'});
})
userRouter.get('/me', controller.getMe)
//requires multer implementation as well!
userRouter.patch('/me', validate.userEdit, controller.updateProfile)
//rout does not require visibility
userRouter.get('/search',validate.search,controller.searchUsers)
userRouter.get('/:id',validate.userId, checkUserVisibility, controller.getUser)


export{
    userRouter
}