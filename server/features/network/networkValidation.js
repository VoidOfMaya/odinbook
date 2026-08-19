import { query } from "express-validator"
const status =[
    query('status').trim().notEmpty().withMessage('a status query must be defined')
    .isAlpha().withMessage('status must be alphabetic only')
    .custom((status)=>isValidStatus(status))
]//status must be one of 4: \n ACTIVE\n PENDING\n DECLINED\n BLOCKED


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
}