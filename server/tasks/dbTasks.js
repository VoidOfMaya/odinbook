import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
const tokenCleaner = async() =>{
    //removes all expired and revoked tokens on a weekly basis
    console.log('db cleaner live!')
    cron.schedule('0 0 * * 0',async()=>{
        try{
            const records = await prisma.refreshToken.deleteMany({
                where:{
                    AND:[
                        {revoked: true},
                        {expiresAt:{
                            lt: new Date()
                            }
                        }
                    ]
                }
            })
            console.log(`Deleted ${records.count} tokens`);

        }catch(err){
            console.error("Token cleanup failed:", err);
        }
    })
}
const resetSocketData = async ()=>{
    console.log('reseting users status!')
    await prisma.user.updateMany({
        data:{
            isOnline:false
        }
    })
}
export {
    tokenCleaner,
    resetSocketData
}