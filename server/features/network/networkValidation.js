import { query, param,body } from "express-validator"
const status =[
    query('status').trim().notEmpty().withMessage('a status query must be defined')
    .isAlpha().withMessage('status must be alphabetic only')
    .custom((status)=>isValidStatus(status))
    
]//status must be one of 4: \n ACTIVE\n PENDING\n DECLINED\n BLOCKED

const statusUpdate= [
    param('connectionId').trim().notEmpty().withMessage('parameter must be defined')
    .isInt().withMessage('param can only be an int number'),
    body('updateStatus').trim().notEmpty().withMessage('a status query must be defined')
    .isAlpha().withMessage('status must be alphabetic only')
    .custom((status)=>isValidStatus(status))
]

//define custom validation functions:
const isValidStatus=(status)=>{
    if(status === 'PENDING') return true;
    if(status === 'ACTIVE') return true;
    if(status === 'DECLINED') return true;
    if(status === 'BLOCKED') return true;
    throw new Error('Provided status is invalid');
    
}
export const validate ={
    status,
    statusUpdate
}
