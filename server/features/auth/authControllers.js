import { validationResult, matchedData } from "express-validator";
import {service} from "./authServices.js";
import { ApiError } from "../../errorhelper.js";
import  crypto  from 'crypto'
import { gitOauth } from "./gitOauthsevice.js";

let currentUserGitId;
const newUser = async (req, res, next) =>{
    //validation handler
    try{    
    const errors = validationResult(req);
    if(!errors.isEmpty()) throw new ApiError(400,"validation Error",errors.array())
    const data = matchedData(req);
    //register user to db
    await service.register(data)
    res.status(201).json({message:'User  registered successfully'})
    }catch(err){
        next(err)
    }
    
}
const localLogin = async (req, res, next)=>{
    //validation handler
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors : errors.array()})
    const data = matchedData(req);
    //logic
    try{
        const result = await service.login(data);
        //pushes threadID and refreshToken to cookies as an httpOnly 
        const production = process.env.NODE_ENV === 'production'

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite: production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            //partitioned: true
        });

        res.cookie('threadId', result.threadId, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite:production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            //partitioned: true
        });
        console.log('debug local authentication');
        res.status(200).json({
            user:{
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                bio: result.user.bio,
                photo: result.user.photo,
                lastOnline: result.user.lastOnline,
                isOnline: result.user.isOnline,
                createdAt: result.user.createdAt,
                isPrivate: result.user.isPrivate
            }, 
            accessToken: result.accessToken
        });
    }catch(err){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
        res.status(401).json({error: err.message || 'Internal Server Error'})  
    }
}
//GITHUB Oauth2 CONTROLLERs
const generateState = async (req, res, next)=>{
    //constructing state and authorization query string
    const state = crypto.randomBytes(32).toString('hex');
    const githubClient = {
        clientId: process.env.GH_CLIENT_ID,
        redirectUrl: process.env.GH_REDIRECT_URL,
        scope: process.env.GH_SCOPE
    }
    const query = 
    `client_id=${githubClient.clientId}&redirect_uri=${githubClient.redirectUrl}&state=${state}&scope=${githubClient.scope}`
    await service.setState(state);
    res.status(200).json({query: query})
}
//  -manages creation or validation of user existance in database
const githubUserManager =async (req,res,next)=>{
    console.log('oauth callback accessed')
    
    const production = process.env.NODE_ENV === 'production'
    const {code, state} = req.query
    //retrive access token
    const accessToken = await gitOauth.gitAccessToken(code)
    // record or create user return users internal id 
    const userId = await gitOauth.gitUserData(accessToken.access_token) //returns record.id of github user
    console.log(`redirecting to frontend`)
    console.log(`sending to ${process.env.CLIENT_URL}`)
    res.redirect(`${process.env.CLIENT_URL}/login/github/${userId}`)
}
//  - logs in user and returns relevant user data   !
const githubLogin = async(req, res, next)=>{
    console.log(`accessed main login sequence `)
    
  try{
        console.log('githubLogin')
        console.log(req.params.gitId);
        const searchId = req.params.gitId;
        const userRecord= await service.getGitId(searchId);
        
        if(!userRecord)throw new Error('Github user id not defined!')
        //validate or create user
        const userSession = await gitOauth.gitUserHandler(userRecord.id)
        //pushes threadID and refreshToken to cookies as an httpOnly 
        const production = process.env.NODE_ENV === 'production'

        res.cookie('refreshToken', userSession.refreshToken, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite: production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            partitioned: true
        });

        res.cookie('threadId', userSession.threadId, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite: production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            partitioned: true
        });
        res.status(200).json({user: userSession.user, accessToken: userSession.accessToken});
    }catch(err){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
        res.status(500).json({error: err.message || 'Internal Server Error'})  
    }
}
// accepts Refresh token string,if valid derives user by token string
const token = async (req, res, next)=>{
    //if refresh token valid  create new access token & refresh token
    //if refresh token invalid return error
    try{
        //validating that cookies exist
        const oldToken = req.signedCookies.refreshToken
        const threadId = req.signedCookies.threadId
        if(!oldToken|| !threadId){
            return res.status(401).json({
                code: 'Missing Credentials',
            })
        }

        //validate token in db
       const refreshToken = await service.validateRToken(oldToken)
        // create new refreshToken
        //handeling grace
        let newRToken ;
        if(refreshToken.grace){
            //get last known valid token for thread id
            newRToken = await service.getUpdatedtoken(refreshToken.threadId)
            if(!newRToken) return res.status(500).json({error: {messag: 'no token head was found!'}});
        }else{
            newRToken = await service.createRToken(refreshToken.userId,threadId,oldToken)
        }
        //create new accessToken
        const newAToken = await service.createAToken(refreshToken.userId )
        //update login date+
        await service.lastLoginUpdate(refreshToken.userId)
        //set user
        const user = await service.getUserById(refreshToken.userId)
        //updates cookies
        // overwrite cookies automatically
        const production = process.env.NODE_ENV === 'production'
        
        res.cookie(
            'refreshToken',newRToken,{
                httpOnly: true,
                secure: production,
                signed: true,
                sameSite: production ? "none" : "lax",
                path:'/',
                maxAge:1000 *60 *60 *24 *7,
                partitioned: true
            }
        );
        res.cookie(
            'threadId',threadId,{
                httpOnly: true,
                secure: production,
                signed: true,
                sameSite: production ? "none" : "lax",
                path:'/',
                maxAge:1000 *60 *60 *24 *7,
                partitioned: true
            }
        );
        //returns user and new access token
        return res.status(201).json({
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                photo: user.photo,
                lastOnline: user.lastOnline,
                isOnline: user.isOnline,
                createdAt: user.createdAt,
                isPrivate: user.isPrivate
            } ,
            accessToken: newAToken, 
        })
    }catch(err){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
        res.status(500).json({code: err.code || 'Internall server Error'})
    }
}
//requires a token thread uuid
const logout = async (req, res, next) =>{
    try{
        const threadId = req.signedCookies.threadId;
        const result = await service.removeTokenThread(threadId);

        const production = process.env.NODE_ENV === 'production'
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: production,
            path:'/',
            sameSite: production? 'none': 'lax',
        });
        res.clearCookie('threadId', {
            httpOnly: true,
            secure: production,
            path:'/',
            sameSite: production? 'none': 'lax',
        });
        res.status(200).json(result)
    }catch(err){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
        res.status(500).json({error: err.message || 'Internal Server Error'})
    }
}
const controller ={
    newUser,
    localLogin,
    token,
    logout,
    generateState,
    githubUserManager,
    githubLogin
}
export{
    controller
}