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
    
}
const editComment = async(id, content)=>{
    return await prisma.comment.update({
        where: {id: Number(id)},
        data:{
            content: String(content),
        }
    })
}
const deleteComment = async (id)=>{

    return await prisma.comment.delete({
        where:{
            id: Number(id)
        }
    })
}
const likeComment =async(id)=>{
    return await prisma.comment.update({
        where: {id: Number(id)},
        data:{
            likes:{
                increment: 1,
            }
        },
        select:{
            likes:true,
        }
    })
}
const dislikeComment =async(id)=>{
    return await prisma.comment.update({
        where: {id: Number(id)},
        data:{likes:{
            decrement: 1
        }},
        select:{
            likes: true
        }
    })
}

const service={
    createComment,
    getComments,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment
}
export{
    service
}