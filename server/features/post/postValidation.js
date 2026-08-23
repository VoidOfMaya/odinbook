import { body, param } from "express-validator"

const content =[
    body('content').trim().notEmpty().withMessage("no content provided!")
    .isString().isLength({min: 1, max: 1000}).withMessage("message length out of range!"),
 ]
const postEdit =[
    body('content').trim().notEmpty().withMessage("no message provided!")
    .isString().isLength({min: 1, max: 750}).withMessage("message length out of range!"),
    param('id').trim().notEmpty().withMessage('a message id is not provided')
    .isInt().withMessage('id must be an integer value').
    toInt()
]
const postId = [
    param('id').trim().notEmpty().withMessage('post id is not provided')
    .isInt().withMessage('id must be an integer value').toInt() 
]
const validate ={
    content,
    postEdit,
    postId
}
export{
    validate
}