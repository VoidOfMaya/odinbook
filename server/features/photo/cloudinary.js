import { cloudinary } from "../../lib/cloudinary.js";

async function cloudUpload(file){

    return new Promise((resolve, reject)=>{
        const stream = cloudinary.uploader.upload_stream(
            {resource_type: 'auto'},
            (err ,res) =>{
                if(err) return reject(err);
                resolve(res);
            }
        )     
        stream.end(file)
    })
}
export{
    cloudUpload,
}