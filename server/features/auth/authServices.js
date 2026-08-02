import {prisma} from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import { threadId } from 'worker_threads';
/*
implementing an access and refresh + token rotation on each refresh
 this will have a few componenets!
 1-access token: used to allow user access on a successfull login(short lifespan)
        -token must be stored in memory  to prevent  Xss theft
        -on expiry prompt/check for a valid refresh token
        -is JWT
2-refresh token: generated on  user access(longer lived lifespan)
        - token is stored in httpOnly cookies
        - use inactive lifetime as a limit on  access 
        - is opaque random generated string!
3- detects reused refresh tokens
        -requirs tracking and storage in db
        -on reuse detect remove all tokens  and revoke access(require user log in)
*keynote this approach for auth builds on the simpler token bearer approach!

*/
//A basic register and  login!
//takes {email, password, name}
const register = async (data) =>{
    //creates user
    const user = await prisma.user.create({
        data:{
            email: data.email,
            name: data.name,
            password: await bcrypt.hash(data.password,10) //hashes and encrypts pasword!
        }
    })
    //grants access to global chat
    await prisma.channelMember.create({
        data:{
            channelId: 1,
            userId: user.id,
            isMember: true
        }
    })
}
const login = async (data) =>{
    const {email, password} = data
    const user = await prisma.user.findUnique({
        where: {email: email}
    })
    if(!user) throw new Error("invalid login");

    const match = await bcrypt.compare(password, user.password);
    if(!match) throw new Error("invalid login");
    //access token:-
    const accessToken = await createAToken(user.id);
    
    // creates a uuid for the A&T token thread
    const sessionId = crypto.randomUUID()
    // refresh token:-
    const refreshToken = await createRToken(user.id,sessionId)

    return{
        threadId: sessionId,
        user:{
            id: user.id,
            email: user.email,
            name: user.name,
            bio: user.bio,
            photo: user.photo,
            createdAt: user.createdAt,
            lastOnline: user.lastOnline
        },
        accessToken,
        refreshToken
    }
}
const createAToken = async (userId, threadId)=>{
    const user = await prisma.user.findUnique({
        where:{id: Number(userId)}
    });
    const accessToken = jwt.sign(
        {id: user.id, email: user.email},
        process.env.APIKEY,
        {expiresIn: '15m'}
    )
    return accessToken
}
// requires user object
const createRToken = async (userId,threadId, token=null)=>{
    //creates a new token
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const oneWeek = 7 * 24 * 60 * 60 * 1000; //one week in milliseconds
    const experationDate = new Date(Date.now() + oneWeek);
    try{
        //revokes old token if exists/ provided
        if(token){
            await revokeRtoken(token)
        }
        //creates new token
        await prisma.refreshToken.create({
            data:{
                token: refreshToken,           
                expiresAt: experationDate,                   
                userId: Number(userId),
                revoked: false,
                threadId: threadId
            }
        })
        return refreshToken        
    }catch(err){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
        throw new Error('Could not generate refresh token');
    }
}
//runs on /refresh
const validateRToken = async (tokenString)=>{
    const now = new Date()
    let graceStatus = false;
    const grace = new Date(Date.now()+ 15000);
    const rToken = await prisma.refreshToken.findUnique({
        where: { token: tokenString }
    });
    //token not found
    if(!rToken){
        const err = new Error("Missing refresh token");
        err.status= 401
        err.code = "NO_REFRESH_TOKEN";
        throw err
    }
    // token is revoked
    if(rToken.revoked) {
        //if token grace period is over:-
        if(now >= rToken.graceUntill){
            await prisma.refreshToken.updateMany({
                where: { userId: rToken.threadId }, 
                data: { 
                    revoked: true, 
                    revokedAt:now,
                    graceUntill: grace,
                }
            });
            
            const err = new Error('Security Breach: Token reuse detected');
            err.status= 401
            err.code = "TOKEN_REUSE_DETRECTED";
            throw err            
        }else{
            graceStatus = true
        }
    }
    //expiration check
    if (rToken.expiresAt < now) {
        await prisma.refreshToken.update({
            where: {token: rToken.token},
            data:{
                revoked: true,
                    revokedAt:now,
                    

            }
        })
        const err = new Error(`token expired: ${rToken.expiresAt}`);
        err.status= 401;
        err.code = "OUTDATED_TOKEN"
        throw err
        
    }
    //returns a valid token object 
    return {userId: rToken.userId, grace: graceStatus, threadId: rToken.threadId}

}
const getUpdatedtoken = async (threadId)=>{
    const count = await prisma.refreshToken.count({
        where:{
            revoked : true
        }
    })
    if(count > 1) throw new Error(`count exceeds 1 valid token per thread`);
    const tokenHead = await prisma.refreshToken.findUnique({
        where:{
            AND: [
            {threadId: threadId},
            {revoked: false}
            ]
        }
    })
    return tokenHead
}
const getUserById = async (id) =>{
    return await prisma.user.findUnique({where:{id: id}});
}
const revokeRtoken = async (token)=>{




    const now = new Date()
    const grace = new Date(Date.now()+ 15000);
    await prisma.refreshToken.update({
        where:{token: token},
        data:{
            revoked: true,
            revokedAt: now,
            graceUntill:grace
        }
    })
}
const removeTokenThread = async ( threadId) =>{
    return await prisma.refreshToken.deleteMany({
        where:{threadId: threadId}
    })
}
const service ={
    login,
    register,
    createAToken,
    createRToken,
    validateRToken,
    getUpdatedtoken,
    getUserById,
    revokeRtoken,
    removeTokenThread 
}
export{
    service
}