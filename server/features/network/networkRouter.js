import { Router } from "express";
import { controller } from "./networkController.js";
import { validate } from "./networkValidation.js";
import { debug } from "./networkMiddleware.js";
const networkRouter = Router();
networkRouter.get('/',async(req, res)=>{
    res.sendStatus(200);
})
//gets connections based on statuse query provided
networkRouter.get('/connection',validate.status,controller.getConnections);
networkRouter.patch('/connection/:connectionId',validate.statusUpdate,controller.updateConnection);
networkRouter.post('/connection',validate.newConenction, controller.createConnection)


export {
    networkRouter
}