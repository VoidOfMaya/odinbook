import{Router} from 'express';
import { validate } from './inputValidations.js';
//import {controller} from './authControllers.js'
import { isAuthenticated, validateRtoken } from './authMiddleware.js';
const authRouter = Router()
authRouter.post('/register', validate.NewAccount, controller.newUser);
authRouter.post('/login', validate.Login, controller.login)
//logout revokes token on backend, delets  access token from frontend
authRouter.delete('/logout',isAuthenticated,controller.logout)
// renew tokens
authRouter.post('/refresh',validateRtoken ,controller.token)


export{
    authRouter
}