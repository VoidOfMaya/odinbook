//Debugging and logging middle Ware
const logParams = async(req, res, next)=>{
    console.log(`STEP 3: Post Router level: id: ${req.params.id}`);
    next();
}
const debug={
    logParams
}
export{
    debug
}