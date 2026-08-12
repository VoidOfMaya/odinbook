import {prisma} from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import { threadId } from 'worker_threads';
import { ApiError } from '../../errorhelper.js';

//A basic register and  login!
//takes {email, password, name}
const register = async (data) =>{
    //creates user
    const emailExists = await prisma.user.findUnique({
        where:{email: data.email}
    })
    if(emailExists) throw new ApiError(409, "Email is already registered.")
    const user = await prisma.user.create({
        data:{
            email: data.email,
            name: data.name,
            password: await bcrypt.hash(data.password,10) //hashes and encrypts pasword!
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
    //update last online date
    await prisma.user.update({
        where:{id: user.id},
        data:{
            lastOnline: new Date()
        }
    })
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
//handels Github logic
//  -get an accesstoken from github
const gitAccessToken = async (code)=>{ 
    const queryConfig =
    `client_id=${process.env.GH_CLIENT_ID}&client_secret=${process.env.GH_CLIENT_SECRET}&code=${code}`
    // attempt to fetch access token
    const response = await fetch(
        `https://github.com/login/oauth/access_token?${queryConfig}`,{
        method: 'GET',
        headers:{
            'Accept': 'application/json'
        }
    })
    const result = await response.json()
    if(!result.access_token) throw new Error('Could not retrieve git access token')
    return result     
}
//  -get user data and email from github
const gitUserData = async (accessToken) =>{
    
    const response = await fetch(
        `https://api.github.com/user`
        ,{
            method: 'GET',
            headers:{
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }
    
    )
    const result = await response.json()
    if(!result) throw new Error('Could not retrieve userData')
    //handle user email
    let primaryEmail;
    if(!result.email){
        const email =await fetch(
            `https://api.github.com/user/emails`
            ,{
                method: 'GET',
                headers:{
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        
        ) 
        const userEmails= await  email.json();
        primaryEmail = userEmails.find(email=> email.primary === true)
    }

    // check if user already exists or create one
    const githubId = String(result.id)
    let record = await prisma.user.findUnique({
        where: {githubId: githubId},
        select:{
            id: true
        }
    })
    
    if(!record){
        record = await prisma.user.create({
            data:{
                githubId: githubId,
                email: result.email || primaryEmail.email,
                name: result.name,
                photo: result.avatar_url,
                bio: result.bio
            },
            select:{
                id: true
            }
        })
    }
    return record.id

}
//  -create or get user from db
const gitUserHandler = async (userId)=>{
   const internalUserId = String(userId)
    const record = await prisma.user.findUnique({
        where:{id: Number(internalUserId)},
        select:{
            id: true,
            email: true,
            name:true,
            bio: true,
            photo: true,
            createdAt: true,
            lastOnline:true,

        }
    })
    //handele registry with the custom tokens system
    //access token:-
    const accessToken = await createAToken(record.id);
    
    // creates a uuid for the A&T token thread
    const sessionId = crypto.randomUUID()
    // refresh token:-
    const refreshToken = await createRToken(record.id,sessionId)

    return{
        threadId: sessionId,
        user:{
            id: record.id,
            email: record.email,
            name: record.name,
            bio: record.bio,
            photo: record.photo,
            createdAt: record.createdAt,
            lastOnline: record.lastOnline
        },
        accessToken,
        refreshToken
    }
}
//CUSTOM AUTH 
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
//updates last login
const lastLoginUpdate = async(userId)=>{
    await prisma.user.update({
        where:{ id: Number(userId)},
        data:{
            lastOnline:  new Date()
        }
    })
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
            AND: [
            {threadId: threadId},
            {revoked: false}
            ]
        }
    })
    if(count > 1) throw new Error(`count exceeds 1 valid token per thread`);
    const tokenHead = await prisma.refreshToken.findFirst({
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
    const grace = new Date(Date.now()+ 30000);
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
    removeTokenThread ,
    lastLoginUpdate,
    gitAccessToken,
    gitUserData,
    gitUserHandler
}
export{
    service
}