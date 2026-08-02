import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { pipe, midware } from './features/toolManager.js';

import passport from 'passport';
import{ createServer} from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

//cron token cleaner
//import { tokenCleaner,resetSocketData } from './tasks/dbCleaner.js';
//import { setOnlineStatus } from './features/sockets/onlineStatus.js';
//import { authenticateConnection } from './features/sockets/middleware.js';
//import { channelEventHandler } from './features/sockets/channelRoom.js';
//import { requestsInbox } from './features/sockets/inbox.js';

const app = express();
const allowedOrigins =
    process.env.NODE_ENV === "production"
        ? [process.env.CLIENT_URL]
        : [
            "http://localhost:5173",
            "http://localhost:4173",
        ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
//debugging:
console.log({
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
});
//parse req string to json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//passport setup goes here:-
//midware.passportConfig();
//app.use(passport.initialize());

//parse cookies
app.use(cookieParser());
// clean up methods:- 
//tokenCleaner(); //runs auto db cleaning function every week!
//resetSocketData();//clears volitile socket managed data

//INSERT SERVER ENDPOINTS HERE: 

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
//500
app.use((err, req, res, next) => {
  console.error(err);
  console.log(req.method, req.originalUrl);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

//server wrapper & socket.io implementation
const server = createServer(app)
const io = new Server(server,{
  //defining CORS
  cors:{
    origin:allowedOrigins,
    //credentials: true,
  }
});
//authenticate socket
//authenticateConnection(io);

//server & socket connection
io.on('connection',(socket)=>{
  console.log('socket running')
  //create root
  socket.join(`user:${socket.user.id}`);
  //setOnlineStatus(socket, io)
  //channelEventHandler(socket, io)
  //requestsInbox(socket, io)
})

//http connection
const PORT = process.env.PORT || 3000;
server.listen(PORT, (err)=>{
    if(err) throw new err ;
    console.log(`Server running on port: ${PORT} (${process.env.NODE_ENV})`);
})
