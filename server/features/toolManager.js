import {authRouter} from './auth/authRouter.js'
import { passportConfig, isAuthenticated } from "./auth/authMiddleware.js";

//centralized midellware & Router buss
const midware ={
    passportConfig, 
    isAuthenticated,
}

const pipe = {
    authRouter,
}
export{
    midware,
    pipe
}