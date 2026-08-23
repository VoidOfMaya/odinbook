import { ne } from "@faker-js/faker";
import { prisma } from "../../lib/prisma";

const getPost = async(postId)=>{
    return await prisma.post.findUnique({
        where:{
            id: Number(postId)
        }
    })
}
const newPost= async (authorId, content, photo= null)=>{
    return await prisma.post.create({
        data:{
            authorId: Number(authorId),
            content: String(content),
            photoUrl: photo
        }
    })
}
const updatePost = async (id, content) =>{
    return await prisma.post.update({
        where:{id: Number(id)},
        data:{
            content: String(content),
            editedAt: new Date()
        }
    })
}
const like = async(id)=>{
    return await prisma.post.update({
        where: {id: Number(id)},
        data:{likes:{
            increment: 1
        }},
        select:{
            likes: true
        }
    })
}
const dislike = async(id)=>{
    return await prisma.post.update({
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
    getPost,
    newPost,
    updatePost,
    like,
    dislike
}
export{
    service
}