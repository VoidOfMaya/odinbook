import { Router  } from "express";
import { validate } from "./feedValidation.js";
import { controller } from "./feedController.js";

const feedRouter = Router();

feedRouter.get('/',
    validate.limit,
    validate.cursor,
    controller.getFeed);
feedRouter.get('/me',
    validate.limit,
    validate.cursor,
    controller.getMyFeed)

export{
    feedRouter
}