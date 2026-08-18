import {authRouter} from './auth/authRouter.js'
import { passportConfig, isAuthenticated } from "./auth/authMiddleware.js";
import { userRouter } from './user/userRouter.js';

//centralized midellware & Router buss
const midware ={
    passportConfig, 
    isAuthenticated,
}

const pipe = {
    authRouter,
    userRouter,
}
export{
    midware,
    pipe
}