import { param,query } from "express-validator"

const userId = [
    param('id').trim().notEmpty().withMessage('post id is not provided')
    .isInt().withMessage('id must be an integer value'),
]
const limit = [
    query('limit').optional({values: 'falsy'})
    .isInt().withMessage('limit must be a number and atleast 3 or greater')
]
const cursor = [
    query('cursor').optional({values: 'falsy'})
    .isInt().withMessage('limit must be a number and atleast 3 or greater')

]
const validate = {
    userId,
    limit,
    cursor
}
export{ validate }

