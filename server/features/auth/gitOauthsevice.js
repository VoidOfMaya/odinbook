import{prisma}from '../../lib/prisma.js'
import crypto from 'crypto'
import { service } from './authServices.js'
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
    const accessToken = await service.createAToken(record.id);
    
    // creates a uuid for the A&T token thread
    const sessionId = crypto.randomUUID()
    // refresh token:-
    const refreshToken = await service.createRToken(record.id,sessionId)

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
const gitOauth = {
    gitAccessToken,
    gitUserData,
    gitUserHandler    
}
export{
    gitOauth
}