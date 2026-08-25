import { prisma } from "../../lib/prisma"

const createComment = async (userId, postId, content)=>{
    return await prisma.comment.create({
        data:{
            postId: Number(postId),
            authorId: Number(userId),
            content: String(content),
        }
    })
}
const getComments = async(postId, limit = 1, cursor = null)=>{
    //return a list of comments based on the limit number cursor point
    //then order by date of creation in a descending order
    let rawChunk;
    if(cursor){
        rawChunk = await prisma.comment.findMany({
            where: {postId: Number(postId)},
            orderBy:{
                createdAt: 'desc'
            },
            take: Number(limit)+ 1,
            cursor: {
                id: Number(cursor),
            }
        })        
    }else{
        rawChunk = await prisma.comment.findMany({
            where: {postId: Number(postId)},
            orderBy:{
                createdAt: 'desc'
            },
            take: Number(limit)+ 1,          
        })  
    }
    // rawchunk = A B C D E F <=rawchunk.length
    //chunck    = A B C D E   <= index <rawchunk.length -1
    //cursor    =           F <= index === rawchunk.length
    const chunk = rawChunk.slice(0, -1)
    const nextCursor = rawChunk[rawChunk.length - 1]
    return {chunk, nextCursor};
    
    /*
    on feed pagination 
    - return should look like :
    {
        meta:{
        limit: 25,
        cursor: 
        },
        //records returned  must be ordered by creation data
        //and ina descending order  
        comments:[
            {comment object},
            .
            .
            .
            {comment object}
        ]
    }
    - if cursor iis not defined or null then get from the most
      up to date records{first request}
      * Must return a valid cursor point that comes after the last record
        based on date of creation!
      * to find next cursor query database for a 2 records long array
        containing the last object in the array then the one that comes after
        it based on creation date  and we will asign that  records id as our nextCursor
        in the metadata
    
    - if cursor is provided
        *query database with that cursor and sort by creation time

    >however i am struggling to figure out how to handle the fact that when
     wetry to pagenate ist possible to do that based on the createdAt field instead of 
     the id
     */
}

const service={
    createComment,
    getComments
}
export{
    service
}