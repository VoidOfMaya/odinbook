import { prisma } from "../../lib/prisma"
const getFriends = async(id)=>{
    const friends = await prisma.user.findUnique({
        where:{id: Number(id)},
            select:{
                friendSent:{
                    where:{status: 'ACTIVE'},
                    include:{
                        friend: true,
                    }
                },
                friendsRecieved:{
                    where:{status: 'ACTIVE'},

                    include:{
                        user: true,
                    }
                }
            }
        })
    return sanitizedFriendData(friends)
}
const getRequests = async (id)=>{
    const requests = await prisma.user.findUnique({
        where:{id: Number(id)},
            select:{
                friendSent:{
                    where:{status: 'PENDING'},
                    include:{
                        friend: true,
                    }
                },
                friendsRecieved:{
                    where:{status: 'PENDING'},

                    include:{
                        user: true,
                    }
                }
            }
        })
    return sanitizedFriendData(requests)   
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

        }
    })
    return array
}

export const service = {
    getFriends,
    getRequests
}