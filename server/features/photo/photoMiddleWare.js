import multer from 'multer';

//const upload = multer({dest: 'uploads/'});
const storage = multer.memoryStorage();

const upload = multer({storage: storage,limits: 
    { fileSize: 10 * 1024 * 1024},
    fileFilter: (req, file, cb)=>{
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(null, false);
            req.fileValidationError = "file type is not jpeg/png/webp ";
            
        }
    }
});

function multerMiddleware (req, res, next){
    upload.single('file')(req, res, (err)=>{
        try{
            if (err?.code === "LIMIT_FILE_SIZE") {
                throw new Error("File exceeds the 10MB size limit.")
            } 
            if (req.fileValidationError) {
                throw new Error(`${req.fileValidationError}`)
            }

            next();          
        }catch(err){
            //handels validating file upload
            return res.status(400).json({msg: err.message})           
        }

    })

}
export{
    multerMiddleware,
}