import { Router  } from "express";
import { validate } from "./feedValidation";
import { controller } from "./feedController";

const feedRouter = Router();

feedRouter.get('/',
    validate.limit,
    validate.cursor,
    controller.getFeed)

export{
    feedRouter
}