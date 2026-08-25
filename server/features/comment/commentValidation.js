import { query, body } from "express-validator"
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

const validate = {
    limit,
    newComment,
    cursor
}
export{
    validate
}