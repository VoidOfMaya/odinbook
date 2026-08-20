import { body,param,query } from 'express-validator';

const userEdit = [
    body('name').trim().isLength({max:25, min: 3}).withMessage('name must be 3 - 25 characters in length')
    .matches(/^[a-zA-Z ]+$/).withMessage('name can have letters and spaces'),
    body('bio').trim().isLength({max:250}).withMessage('bio limit is 250 characters in length')
    .withMessage('bio can only be letters, spaces and numbers'),
    body('photo').trim()
]
const userId =[
    param('id').trim().notEmpty().withMessage('no user id provided')
    .toInt().withMessage('id must be a number')
]
const search=[
    query('name').trim().isLength({max:25, min: 1}).withMessage('name must be 3-25 characters in length')
    .matches(/^[a-zA-Z ]+$/).withMessage('name can have letters and spaces')
]
const validate ={
    userId,
    userEdit,
    search
}

export{
    validate
}