import{Router} from 'express';
import { validate } from './inputValidations.js';
import {controller} from './authControllers.js';
import { github } from '../../utils/github.js';
import { isAuthenticated, validateRtoken } from './authMiddleware.js';
const authRouter = Router()
authRouter.post('/register', validate.NewAccount, controller.newUser);
authRouter.post('/login/local', validate.Login, controller.localLogin);
authRouter.get('/login/github/cb', controller.githubUserManager)
authRouter.get('/login/github/:userId',controller.githubLogin)

//logout revokes token on backend, delets  access token from frontend
authRouter.delete('/logout',isAuthenticated,controller.logout)
// renew tokens
authRouter.post('/refresh',validateRtoken ,controller.token)


export{
    authRouter
}