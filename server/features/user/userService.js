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
const findMatchingUsers= async(name)=>{
    const users = await prisma.user.findMany({
        where:{
            name: {
            startsWith: String(name)
            }
        },
        select:{
            id: true,
            name: true,
            photo: true
        },
        orderBy:{
            name: "desc",
        },
    })
    return users
}
const service = {
    getUser,
    updateMyData,
    isUserPrivate,
    findMatchingUsers,
}
export {
    service
}