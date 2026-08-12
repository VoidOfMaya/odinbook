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
        });

        res.cookie('threadId', result.threadId, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite: production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.status(200).json({user: result.user, accessToken: result.accessToken});
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
    //Setting state to a httpOnly cookie
    const production = process.env.NODE_ENV === 'production'
    res.cookie('state', state, {
        httpOnly: true,
        secure: production,
        sameSite: production ? "none" : "lax",
        signed: true,
        path:'/',
        maxAge: 1000 * 60 * 15, // 15 minute shortlived
    });
    res.status(200).json({query: query})
}
//  -manages creation or validation of user existance in database
const githubUserManager =async (req,res,next)=>{
    console.log('oauth callback accessed')
    
    const production = process.env.NODE_ENV === 'production'
    const {code, state} = req.query
    const cookieState = req.signedCookies.state
    //validate  state 
    if(!state === cookieState){
        console.log(`state mismatch, untrusted source`)
        res.clearCookie('state',{
            httpOnly: true,
            secure: production,
            path:'/',
            sameSite: production? 'none': 'lax',
        })
        throw new Error('Unauthorized state')
    }
    //retrive access token
    const accessToken = await gitOauth.gitAccessToken(code)
    // record or create user return users internal id 
    const userId = await gitOauth.gitUserData(accessToken.access_token) 
    //clear state cookie
    res.clearCookie('state',{
        httpOnly: true,
        secure: production,
        path:'/',
        sameSite: production? 'none': 'lax',
    })
    // define temporary secure user id
    res.cookie('userId', userId, {
        httpOnly: true,
        secure: production,
        signed: true,
        sameSite: production ? "none" : "lax",
        path:'/',
        maxAge: 1000 * 60 * 15, // 15 minute shortlived
    });
    res.redirect(`http://localhost:5173/login/github`)
}
//  - logs in user and returns relevant user data   !
const githubLogin = async(req, res, next)=>{
    console.log(`accessed main login sequence `)
    
  try{
        const gitId = req.signedCookies.userId
        if(!gitId)throw new Error('Github user id not defined!')
        //validate or create user
        const userSession = await gitOauth.gitUserHandler(gitId)
        //pushes threadID and refreshToken to cookies as an httpOnly 
        const production = process.env.NODE_ENV === 'production'

        res.cookie('refreshToken', userSession.refreshToken, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite: production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        res.cookie('threadId', userSession.threadId, {
            httpOnly: true,
            secure: production,
            signed: true,
            sameSite: production ? "none" : "lax",
            path:'/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        //remove temporary id token:
        res.clearCookie('userId',{
            httpOnly: true,
            secure: production,
            path:'/',
            sameSite: production? 'none': 'lax',
        })
            
        res.status(200).json({user: userSession.user, accessToken: userSession.accessToken});
    }catch(err){
        next(err)
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
                createdAt: user.createdAt
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