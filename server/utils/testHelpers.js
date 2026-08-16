import cookieSignature from 'cookie-signature';
import cookieParser from "cookie-parser";
import {jest} from '@jest/globals';

const generateSignedCookieHeader= (name,value, )=>{
    const signedValue = cookieSignature.sign(value, process.env.CRYPTKEY)
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
const mockOauth = (options)=>{
    /*
    const codeResponse = new Response(
        JSON.stringify({code: 11223344, state: options.state}),
        {status: 200, headers:{'Content-Type': 'application/json'}}
    )
    */
    const tokenResponse = new Response(
            JSON.stringify({access_token: 'fake-access-token'}),
            {status: 200,headers: {'Content-Type': 'application/json'}}
    )    
    const userResponse = new Response(
        JSON.stringify({
            id: 1,
            email: 'mocked@user.email',
            name: 'jestMocker',
            avatar_url:'myjestPHoto.jpg',
            bio: 'this is fake user data',
        }),
        {status: 200,headers: {'Content-Type': 'application/json'}}
    ) 
    fetch.mockResolvedValueOnce(tokenResponse)
         .mockResolvedValueOnce(userResponse)
           
}
const testHelper = {
    generateSignedCookieHeader,
    decodeSignedCookie,
    mockOauth
}
export {
    testHelper
}