import passport from 'passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {prisma} from '../../lib/prisma.js';
import 'dotenv/config';

const passportConfig=()=>{
    const options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.APIKEY,
    }
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
}
const isAuthenticated = passport.authenticate('jwt',{session:false});

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
            if(dbToken.revoked){ 
                await wipeTokenByUserId(dbToken.userId)
                throw new Error ('invalid token use detected')
            }
            next()
        }
    }catch(err){
        //handles session expiration
        res.clearCookie('refreshToken');
        res.clearCookie('threadId')
        return res.status(401).json({
            message: 'Session expired'
        })
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
    validateRtoken
}