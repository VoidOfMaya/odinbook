
import { app } from "./app";
import { corsOpts } from "./cors";
//server wrapper & socket.io implementation
const server = createServer(app)
const io = new Server(server,{
  //defining CORS
  cors:corsOpts
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