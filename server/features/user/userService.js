import {prisma} from "../../lib/prisma.js"
const getUser = async(id)=>{
    //{id, name, bio. photo, isOnline,lastOnline, createdAt}
    return await prisma.user.findUnique({
        where: {id: Number(id)},
        select: {
            id: true,
            name: true,
            photo: true,
            bio: true,
            isOnline: true,
            lastOnline: true,
            createdAt: true
        }
    })
}
const updateMyData= async(id, data, photo = null)=>{
    const user = await prisma.user.findUnique({where:{id: Number(id)}})
    await prisma.user.update({
        where: {id: Number(id)},
        data:{
            name: data.name ===''? user.name: data.name,
            bio:   data.bio === ''? user.bio : data.bio,
            photo: photo
        },
    })

}
const isUserPrivate = async(id)=>{

}
const findMatchingUsers= async(name, userId, limit = 15, cursor= null)=>{
    //uuser search pagination
    let rawChunk;
    if(cursor){
        rawChunk = await prisma.user.findMany({
            where:{
                name:{startsWith: String(name)}
            },
            orderBy:{
                createdAt: 'desc'
            },
            select:{
                id: true,
                name: true,
                photo: true,
                friendSent:{
                    where: {friendId: Number(userId)},
                    select:{
                        status: true
                    }
                } ,
                friendsRecieved:{
                    where: {userId: Number(userId)},
                    select:{
                        status: true
                    }
                }
            },
            take: Number(limit)+ 1,
            cursor: {
                id: Number(cursor),
            },
        })        
    }else{
        rawChunk = await prisma.user.findMany({
            where:{
                name:{startsWith: String(name)}
            },
            orderBy:{
                createdAt: 'desc'
            },
            select:{
                id: true,
                name: true,
                photo: true,
                friendSent:{
                    where:{friendId: Number(userId)},
                    select:{
                        status: true
                    }
                } ,
                friendsRecieved:{
                    where:{userId: Number(userId)},
                    select:{
                        status: true
                    }
                }
            },            
            take: Number(limit)+ 1,         
        })  
    }
    const chunk = rawChunk.slice(0, -1)
    const nextCursor = rawChunk[rawChunk.length - 1]
    return {chunk, nextCursor};
}
const getAllUsers = async(userId, limit =15, cursor= null)=>{
    //uuser index pagination
    let rawChunk;
    if(cursor){
        rawChunk = await prisma.user.findMany({
            orderBy:{
                createdAt: 'desc'
            },
            select:{
                id: true,
                name: true,
                photo: true,
                friendSent:{
                    where: {friendId: Number(userId)},
                    select:{
                        status: true
                    }
                } ,
                friendsRecieved:{
                    where: {userId: Number(userId)},
                    select:{
                        status: true
                    }
                }
            },
            take: Number(limit)+ 1,
            cursor: {
                id: Number(cursor),
            },
        })        
    }else{
        rawChunk = await prisma.user.findMany({
            orderBy:{
                createdAt: 'desc'
            },
            select:{
                id: true,
                name: true,
                photo: true,
                friendSent:{
                    where:{friendId: Number(userId)},
                    select:{
                        status: true
                    }
                } ,
                friendsRecieved:{
                    where:{userId: Number(userId)},
                    select:{
                        status: true
                    }
                }
            },            
            take: Number(limit)+ 1,         
        })  
    }
    //validate that prisma has enough records for pagination
    const  hasEnoughRecords =  rawChunk.length > Number(limit);

    const chunk = hasEnoughRecords
        ? rawChunk.slice(0, -1)
        : rawChunk
    const nextCursor = hasEnoughRecords
        ? rawChunk[rawChunk.length - 1]
        : null;
    return {chunk, nextCursor};
}
const service = {
    getUser,
    updateMyData,
    isUserPrivate,
    findMatchingUsers,
    getAllUsers
}
export {
    service
}