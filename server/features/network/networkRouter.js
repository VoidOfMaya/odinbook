import { Router } from "express";
import { controller } from "./networkController.js";
import { validate } from "./networkValidation.js";
const networkRouter = Router();
networkRouter.get('/',async(req, res)=>{
    res.sendStatus(200);
})
//gets connections based on statuse query provided
networkRouter.get('/connection',validate.status,controller.getConnections);
networkRouter.patch('/connection/:connectionId',validate.statusUpdate,controller.updateConnection);
networkRouter.post('/connection',validate.recipientId, controller.createConnection)
//networkRouter.get('/requests',validate.query, controller.getPendingRequests)

export {
    networkRouter
}