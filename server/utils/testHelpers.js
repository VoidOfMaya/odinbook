import cookieSignature from 'cookie-signature';
import cookieParser from "cookie-parser";

const generateSignedCookieHeader= (name,value, secret)=>{
    const signedValue = cookieSignature.sign(value, secret)
    return `${name}=s%3A${encodeURIComponent(signedValue)}`
}
const decodeSignedCookie = (cookie) =>{
    //isolating cookie variables
    const rawCookie = cookie.split(";")[0].split("=")[1];
    //decoding raw cookie variables
    const decodedCookie = decodeURIComponent(rawCookie);
    //parse clean data
    const cleanCookie = cookieParser.signedCookie(decodedCookie, process.env.CRYPTKEY);
    //validates cookie existance
    if(cleanCookie === false)throw new Error(`Cookie decoding failed!`)
    return cleanCookie              
}

const testHelper = {
    generateSignedCookieHeader,
    decodeSignedCookie
}
export {
    testHelper
}