import { prisma } from '../../lib/prisma.js';
import { validationResult, matchedData } from "express-validator";

const isUserAuthor = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    try{
        const data = matchedData(req);
        const author = await prisma.post.findUnique({
            where: {
                id: Number(data.id)
            },
            select:{
                authorId: true
            }
        })

        if(author.id === req.user.id) return next()
    }catch(err){
        next(err)
    }
}

export{
    isUserAuthor
}