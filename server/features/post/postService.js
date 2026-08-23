import { ne } from "@faker-js/faker";
import { prisma } from "../../lib/prisma";

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
const service={
    newPost,
    updatePost,
}
export{
    service
}