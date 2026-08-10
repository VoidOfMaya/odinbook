import{Router} from 'express';
import { validate } from './inputValidations.js';
import {controller} from './authControllers.js';
import { github } from '../../utils/github.js';
import { isAuthenticated, validateRtoken } from './authMiddleware.js';
const authRouter = Router()
authRouter.post('/register', validate.NewAccount, controller.newUser);
authRouter.post('/login/local', validate.Login, controller.localLogin);
authRouter.get('/login/github/cb', async (req, res)=>{
    console.log('oauth callback accessed')
    console.log(req.query)
    //res.status(200).json({data: req.body})
})

//logout revokes token on backend, delets  access token from frontend
authRouter.delete('/logout',isAuthenticated,controller.logout)
// renew tokens
authRouter.post('/refresh',validateRtoken ,controller.token)


export{
    authRouter
}