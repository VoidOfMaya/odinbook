import { prisma } from "../../lib/prisma";

const newPost= async (authorId, content, photo= null)=>{
    await prisma.post.create({
        data:{
            authorId: Number(authorId),
            content: String(content),
            photoUrl: photo
        }
    })
}
const service={
    newPost
}
export{
    service
}