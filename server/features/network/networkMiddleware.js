const logReqContent = (req, res, next) =>{
    console.log(`========== BEGIN DEBUG ==========`)
    console.log('requst param content:')
    console.log(req.param)
    console.log('requst body content:')
    console.log(req.body)
    console.log(`========== END DEBUG ==========`)
    next()
}
const debug= {
    logReqContent,
}
export{
    debug
}