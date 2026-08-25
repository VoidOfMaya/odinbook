import { query, body, param } from "express-validator"
// can be empty but if provided get the exavt amount of comments
const limit = [
    query('limit').optional({values: 'falsy'})
    .isInt().withMessage('limit must be a number and atleast 3 or greater')
]
const newComment=[
    body('comment').trim().notEmpty().withMessage("comment can not be empty!")
    .isString().isLength({min: 1, max: 750}).withMessage("message length out of range!")
]
const cursor = [
    query('cursor').optional({values: 'falsy'})
    .isInt().withMessage('limit must be a number and atleast 3 or greater')

]
const id = [
    param('id').trim().notEmpty().withMessage('post id is not provided')
    .isInt().withMessage('id must be an integer value'),
]
const comment=[
    body('content').trim().notEmpty().withMessage("comment can not be empty!")
    .isString().isLength({min: 1, max: 750}).withMessage("message length out of range!") 

]

const validate = {
    limit,
    newComment,
    cursor,
    comment,
    id
}
export{
    validate
}