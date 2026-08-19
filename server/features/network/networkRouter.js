import { Router } from "express";
import { controller } from "./networkController";
import { validate } from "./networkValidation";
const networkRouter = Router();
networkRouter.get('/',async(req, res)=>{
    res.sendStatus(200);
})
//gets connections based on statuse query provided
networkRouter.get('/connection',validate.status,controller.getConnections)
//networkRouter.get('/requests',validate.query, controller.getPendingRequests)

export {
    networkRouter
}