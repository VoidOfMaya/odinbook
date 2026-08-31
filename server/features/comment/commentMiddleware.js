import { validationResult, matchedData } from "express-validator"
import { prisma } from "../../lib/prisma.js";
//Debugging and logging middle Ware
const logParams = async(req, res, next)=>{
    console.log(`STEP 3: Post Router level: id: ${req.params.id}`);
    next();
}

const isUserAuthor = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const data = matchedData(req);
    try{
    
        const comment = await prisma.comment.findUnique({
            where: {
                id: Number(data.id)
            },
            select:{
                authorId: true
            }
        })
        //validate post exists
        if (!comment)return next(new ApiError(404, "Post not found"));
        //validate user owns the post
        if (Number(comment.authorId) === Number(req.user.id))return next();
    
        throw new ApiError(403, "Access of Unauthorized resource");

    }catch(err){

        return next(err)
    }
}

const debug={
    logParams
}
export{
    debug,
    isUserAuthor
}