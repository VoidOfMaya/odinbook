import { ApiError } from "../../errorhelper.js";
import { prisma } from "../../lib/prisma.js"


const createConnection = async(senderId, recipientId)=>{
    
    //validate connection!
    const friends = await prisma.userFriends.findFirst({
        where:{
            status: {not: "DECLINED"},
            OR:[
                //case A
                {userId: Number(senderId), friendId:Number(recipientId)},
                //case B
                {userId: Number(recipientId), friendId:Number(senderId)},
            ]
        }
    })
    if(friends) throw new ApiError(409,"conflicting connection record was found");
    //create connection:-
    const result = await prisma.userFriends.create({
        data:{
            userId: Number(senderId),
            friendId: Number(recipientId),
            status: 'PENDING'
        },
        select:{
            id: true
        }
    })
    return result;
}
const getConnections = async(id, status)=>{
    const friends = await prisma.user.findUnique({
        where:{id: Number(id)},
            select:{
                friendSent:{
                    where:{status: String(status)},
                    include:{
                        friend: true,
                    }
                },
                friendsRecieved:{
                    where:{status: String(status)},

                    include:{
                        user: true,
                    }
                }
            }
        })
    return sanitizedFriendData(friends)
}
const updateConnection = async(id, status)=>{
    await prisma.userFriends.update({
        where:{ id: Number(id)},
        data:{ status: String(status)}
    })
}
const sanitizedFriendData = (friends) =>{
    let array =[];
    //sanitizes sent friendships
    friends.friendSent.forEach(connection =>{
        const friend = connection.friend;
        if(connection.status === "ACTIVE"){
            array.push({
                meta:{
                    connectionId: connection.id,
                    status: connection.status,        
                },
                user:{
                    id: friend.id, 
                    name: friend.name,
                    photo: friend.photo,
                    bio: friend.bio,
                    onlineStatus: 
                        friend.isOnline? friend.isOnline : friend.lastOnline,
                }
            })            
        }
        if(connection.status === "PENDING"){
            array.push({
                meta:{
                    connectionId: connection.id,
                    status: connection.status,
                    isInitiator: true,     
                },
                user:{
                    id: friend.id, 
                    name: friend.name,
                    photo: friend.photo,
                    bio: friend.bio,
                    onlineStatus: 
                        friend.isOnline? friend.isOnline : friend.lastOnline,
                }
            })
        }
        if(connection.status === "DECLINED"){
            array.push({
                meta:{
                    connectionId: connection.id,
                    status: connection.status,
                    isInitiator: true,     
                }
            })
        }
        if(connection.status === "BLOCKED"){
            array.push({
                meta:{
                    connectionId: connection.id,
                    status: connection.status,
                    isInitiator: true,     
                }
            })
        }

    })
    //sanitizes recieved friendships
    friends.friendsRecieved.forEach(connection =>{
        const friend = connection.user
        //checks for friendship duplication!
        const exists = array.some(connection => connection.id === friend.id);
        if(!exists){
            if(connection.status === "ACTIVE"){
                array.push({
                    meta:{
                        connectionId: connection.id,
                        status: connection.status,                       
                    },
                    user:{
                        id: friend.id,
                        name: friend.name,
                        photo: friend.photo,
                        bio: friend.bio,
                        onlineStatus:
                            friend.isOnline? friend.isOnline : friend.lastOnline,
                    }
                })
            }
            if(connection.status === "PENDING"){
                array.push({
                    meta:{
                        connectionId: connection.id,
                        status: connection.status, 
                        isInitiator: false,                        
                    },
                    user:{
                        id: friend.id,
                        name: friend.name,
                        photo: friend.photo,
                        bio: friend.bio,
                        onlineStatus:
                            friend.isOnline? friend.isOnline : friend.lastOnline,
                    }
                })
            }
        if(connection.status === "DECLINED"){
            array.push({
                meta:{
                    connectionId: connection.id,
                    status: connection.status,
                    isInitiator: true,     
                }
            })
        }
        if(connection.status === "BLOCKED"){
            array.push({
                meta:{
                    connectionId: connection.id,
                    status: connection.status,
                    isInitiator: true,     
                }
            })
        }

        }
    })
    return array
}

export const service = {
    getConnections,
    updateConnection,
    createConnection
}