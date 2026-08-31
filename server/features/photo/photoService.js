import {prisma} from '../../lib/prisma.js'
const setProfilePicture = async (userId, photoUrl)=>{
    return await prisma.user.update({
        where:{id: Number(userId)},
        data:{
            photo: photoUrl
        }
    })
}
const service ={
    setProfilePicture
}
export {
    service
}