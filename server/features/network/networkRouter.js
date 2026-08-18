import { Router } from "express";
import { controller } from "./networkController";
const networkRouter = Router();
networkRouter.get('/',async(req, res)=>{
    res.sendStatus(200);
})
networkRouter.get('/myfriends',controller.getMyFriends)
networkRouter.get('/requests', controller.getPendingRequests)

export {
    networkRouter
}