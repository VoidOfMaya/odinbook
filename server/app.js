import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { pipe, midware } from './features/toolManager.js';

import passport from 'passport';
import cookieParser from 'cookie-parser';
import { corsOpts } from './cors.js';

import { ApiError } from './errorhelper.js';
//import { setOnlineStatus } from './features/sockets/onlineStatus.js';
//import { authenticateConnection } from './features/sockets/middleware.js';
//import { channelEventHandler } from './features/sockets/channelRoom.js';
//import { requestsInbox } from './features/sockets/inbox.js';

const app = express();

app.use(cors(corsOpts));
//debugging:
console.log({
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
});
//parse req string to json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//passport setup goes here:-
midware.passportConfig();
app.use(passport.initialize());

//parse cookies
app.use(cookieParser(process.env.CRYPTKEY));
//CRYPTKEY is a cryptographically generated 32byte hex string

//INSERT SERVER ENDPOINTS HERE: 
app.use('/auth',pipe.authRouter)
app.use('/user',midware.isAuthenticated, pipe.userRouter)
app.use('/network',midware.isAuthenticated,pipe.networkRouter)
app.use('/feed',midware.isAuthenticated,/*feed router here*/)
//app.use('/post', midware.isAuthenticated,/*post router*/)
//app.use('/comment',midware.isAuthenticated,/*comment router*/)
//server health endpoint:
app.get("/health", (req, res) => {
    console.log("Health endpoint hit");
    res.status(200).json({ status: "ok" });
});
//error handlers:
//404
app.use((req, res, next)=>{
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
})
app.use((err, req, res, next) => {
    //
    const logErr = !(err instanceof ApiError) || err.log
    if(logErr){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
    }

    return res.status(err.status || 500).json({
        error:{
            message: err.message || "Internal Server Error",
            details: err.details ?? null
        }
  });
});

//export app for testing
export{
    app
}