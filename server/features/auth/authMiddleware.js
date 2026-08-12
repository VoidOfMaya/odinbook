import passport from 'passport';
import GitHubStrategy from 'passport-github'
import {ExtractJwt, Strategy} from 'passport-jwt';
import {prisma} from '../../lib/prisma.js';
import 'dotenv/config';
import { ApiError } from '../../errorhelper.js';

const passportConfig=()=>{
    //create jwt
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.APIKEY,
    }
    //local strategy
    passport.use(new Strategy(options, async( payload, done)=>{
        try{
            const user = await prisma.user.findUnique({
                where: {id: payload.id},
                select:{
                    id: true,
                    email:true,
                    name:true,
                    bio:true,
                    photo:true,
                    lastOnline:true,
                    isOnline: true,
                    createdAt:true
                }
            });
            if(!user) return done(null, false);
            return done(null, user);
        }catch(err){
            console.error({
                message: err.message,
                method: req.method,
                path: req.originalUrl,
                stack: err.stack,
            });
            done(err)
        }
    }))
    /*
    // GitHub OAuth Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GH_CLIENT_ID,
        clientSecret: process.env.GH_CLIENT_SECRET,
        callbackURL: process.env.GH_CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
            try{
                //find user if exists
                let user = await prisma.user.findUnique({
                    where: {githubId:profile.id},
                    select:{
                        id: true,
                        email:true,
                        name:true,
                        bio:true,
                        photo:true,
                        lastOnline:true,
                        isOnline: true,
                        createdAt:true
                    }
                });  
                if(!user) user = await prisma.create({
                    data:{
                        githubId:profile.id,
                        email: profile.email,
                        name: profile.name,
                        photo: profile.avatar_url,
                        bio: profile.bio,
                    },
                    select:{
                        id: true,
                        email:true,
                        name:true,
                        bio:true,
                        photo:true,
                        lastOnline:true,
                        isOnline: true,
                        createdAt:true
                    }
                })
              
            }catch(err){
                console.error({
                    message: err.message,
                    method: req.method,
                    path: req.originalUrl,
                    stack: err.stack,
                });
                done(err)
            }

        return done(null, user);
    }));
    */
}
const isAuthenticated = passport.authenticate('jwt',{session:false});

const isValidGitReq = async(req,res,next)=>{
    try{
        const {code, state} = req.query
        const cookieState = req.signedCookies.state
        //clear cookie
        const production = process.env.NODE_ENV === 'production'
        res.clearCookie('state',{
            httpOnly: true,
            secure: production,
            path:'/',
            sameSite: production? 'none': 'lax',
        })
        //validate  state 
        if(state !== cookieState)throw new Error('Unauthorized state')   
        
        next()  
    }catch(err){
        next(err)
    }

}


const validateRtoken = async(req, res, next)=>{
    const token = req.cookies.refreshToken;
    try{
        const dbToken = await  prisma.refreshToken.findUnique({
            where:{token: token}
        })
        if(!dbToken){ //validate token existance
            throw new Error ('invalid token use detected')
        }
        if(dbToken){
            //validates if out of date
            const now = Date.now()
            if(dbToken.expiresAt < now) throw new Error('Token expired')
            //validates revoke status
            if(dbToken.revoked && dbToken.graceUntill.getTime() < now){ 
                await wipeTokenByUserId(dbToken.userId)
                throw new Error ('invalid token use detected')
            }
            next()
        }
    }catch(err){
        //handles session expiration
        res.clearCookie('refreshToken');
        res.clearCookie('threadId')

        next(new ApiError(401, err))
    }
}
const wipeTokenByUserId = async(id)=>{
    await prisma.refreshToken.deleteMany({
        where:{ userId: Number(id)}
    }) 
}

export{
    passportConfig,
    isAuthenticated,
    validateRtoken,
    isValidGitReq
}