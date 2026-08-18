import { prisma } from "../../lib/prisma";
import { validationResult, matchedData } from "express-validator";


const checkUserVisibility = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors : errors.array()})
    const {id} = matchedData(req);  

    try{
        const user = await prisma.user.findUnique({
            where:{id: Number(id)},
            select:{
                isPrivate: true,
                friendSent:{where:{ status: "ACTIVE"}},
                friendsRecieved:{where:{ status: "ACTIVE"}}
            }
        })
        //console.log(user);
        if(user.isPrivate){
            //is authenticated user friends with requested user?
            const isFriend = 
                user.friendSent.some(record => record.friendId === req.user.id)||
                user.friendsRecieved.some(record => record.userId === req.user.id);
            if(isFriend) return next();
            return res.status(403).json({message: 'Forbbiden'})
        }
        next();
    }catch(err){
        next(err)
    }
}
export{
    checkUserVisibility
}