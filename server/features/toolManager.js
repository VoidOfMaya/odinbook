import {authRouter} from './auth/authRouter.js'
import { passportConfig, isAuthenticated } from "./auth/authMiddleware.js";
import { userRouter } from './user/userRouter.js';
import { networkRouter } from './network/networkRouter.js';
import { postRouter } from './post/postRouter.js';

//centralized midellware & Router buss
const midware ={
    passportConfig, 
    isAuthenticated,
}

const pipe = {
    authRouter,
    userRouter,
    networkRouter,
    postRouter,
}
export{
    midware,
    pipe
}