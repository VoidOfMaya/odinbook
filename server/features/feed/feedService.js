import { prisma } from "../../lib/prisma";
   //- friends: 
   // should be an array of user ids that are in a connection/friendship
   //with the user, where connection statuse = "ACTIVE"
const getfeed = async(friends, limit = 15, cursor = null)=>{

    //find posts where post author is one of users connections
    let rawChunk;
    if(cursor){
        rawChunk = await prisma.post.findMany({
            where: {
                authorId: {
                    in: friends
                }   
            },
            orderBy:{
                createdAt: 'desc'
            },
            take: Number(limit)+ 1,
            cursor: {
                id: Number(cursor),
            },
            include:{
                comments:{
                    orderBy:{
                        createdAt:'desc'
                    },
                    take: 3,
                },
            }
        })        
    }else{
        rawChunk = await prisma.post.findMany({
            where: {
                authorId: {
                    in: friends
                }   
            },
            orderBy:{
                createdAt: 'desc'
            },
            take: Number(limit)+ 1, 
            include:{
                comments:{
                    orderBy:{
                        createdAt:'desc'
                    },
                    take: 3,
                },
            }         
        })  
    }
    // rawchunk = A B C D E F <=rawchunk.length
    //chunck    = A B C D E   <= index <rawchunk.length -1
    //cursor    =           F <= index === rawchunk.length
    const chunk = rawChunk.slice(0, -1)
    const nextCursor = rawChunk[rawChunk.length - 1]
    return {chunk, nextCursor};
    
}
const service = {
    getfeed,
}
export{ service }