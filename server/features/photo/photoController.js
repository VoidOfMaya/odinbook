import {cloudUpload} from './cloudinary.js'
import { service } from './photoService.js';

 
async function uploadFile(req, res){
   //data validlation happens on multer middleware layer

   //handle data upload:
    try{            
      const result = await cloudUpload(req.file.buffer);

      //checks if cloudinary  returned the correct objects
      if(!result.secure_url){ 
        throw new Error('errors','internal Error: cloudinary url faulty, try again later!' )
      }
      //update user with a new profile photo url
      const userPhoto = await service.setProfilePicture(req.user.id, result.secure_url)
      res.status(201).json({msg: 'photo updated successfully!'})
   }catch(err){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
      res.status(500).json({msg: err.message})
   }

 }
 
 export{
    uploadFile,
 }