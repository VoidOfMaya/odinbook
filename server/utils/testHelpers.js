import cookieSignature from 'cookie-signature';
import cookieParser from "cookie-parser";
import {jest} from '@jest/globals';
import request from "supertest";
import { app } from "../app.js";

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
//takes resource name and accerss token
const checkAuthProtection = async(resource, getToken)=>{
   //- midware is endpoint protected
    describe(`${resource} endpoint is protected`,()=>{
        test(`request ${resource} without valid jwt`, async()=>{
            const res = await request(app).get(`/${resource}`);
            const result = await res

            expect(result.status).toBe(401);
        })
        test(`request ${resource} with invalid jwt`,async()=>{
            const res = await request(app).get(`/${resource}`)
            .set('Authorization', `Bearer fake-access-token-lol`);
            const result = await res

            expect(result.status).toBe(401);         
        })
        test(`request ${resource} with valid jwt`,async()=>{
            const accessToken = getToken();
            const res = await request(app).get(`/${resource}`)
            .set('Authorization', `Bearer ${accessToken}`);
            const result = await res;
            ///console.log(result)
            expect(result.status).toBe(200); 
        })
    })
}
const testHelper = {
    generateSignedCookieHeader,
    decodeSignedCookie,
    mockOauth,
    checkAuthProtection
}
export {
    testHelper
}