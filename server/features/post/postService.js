
import { prisma } from "../../lib/prisma.js";

const getPost = async(postId)=>{
    return await prisma.post.findUnique({
        where:{
            id: Number(postId)
        },
        include:{
            User:{
                select:{
                    photo: true,
                    name: true
                }
            }
        }
    })
}
const newPost= async (authorId, content, photo= null)=>{
    return await prisma.post.create({
        data:{
            authorId: Number(authorId),
            content: String(content),
            photoUrl: photo
        },
        include:{
            User:{
                select:{
                    photo: true,
                    name: true,
                    id: true
                }
            }
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
const deletePost = async(postId)=>{
    //check if post has comments
    const hasComments = await prisma.comment.count({
        where:{postId: Number(postId)}
    })
    console.log(`deleting post: validating comment count: ${hasComments}`)
    if(hasComments > 0){
        await prisma.comment.deleteMany({
            where:{postId: Number(postId)},
        })        
    }

    return await prisma.post.delete({
        where:{id: Number(postId)},
        select:{
            id:true,
        }
    })


}
const service={
    getPost,
    newPost,
    updatePost,
    deletePost,
    like,
    dislike
}
export{
    service
}