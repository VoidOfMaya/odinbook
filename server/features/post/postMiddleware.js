import { ApiError } from '../../errorhelper.js';
import { prisma } from '../../lib/prisma.js';
import { validationResult, matchedData } from "express-validator";

const isUserAuthor = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const data = matchedData(req);
    try{
    
        const post = await prisma.post.findUnique({
            where: {
                id: Number(data.id)
            },
            select:{
                authorId: true
            }
        })
        //validate post exists
        if (!post)return next(new ApiError(404, "Post not found"));
        //validate user owns the post
        if (Number(post.authorId) === Number(req.user.id))return next();
    
        throw new ApiError(403, "Access of Unauthorized resource");

    }catch(err){

        return next(err)
    }
}
// debugging middleware:
const logParams = async(req, res, next)=>{
    console.log(`STEP 2: Post Router level id: ${req.params.id}`);
    next();
}
const debug={
    logParams
}
export{
    isUserAuthor,
    debug
}