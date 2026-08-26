import { Router  } from "express";
import { validate } from "./feedValidation";
import { controller } from "./feedController";

const feedRouter = Router();

feedRouter.get('/',async(req, res)=>{res.sendStatus(200)});
feedRouter.get('/:id',
    validate.userId,
    validate.limit,
    validate.cursor,
    controller.getFeed)

export{
    feedRouter
}