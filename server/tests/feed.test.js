import request from "supertest";
import { app } from "../app.js";
import {prisma} from '../lib/prisma.js'
import bcrypt from "bcryptjs";
import crypto from 'crypto'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest } from '@jest/globals'
import { testHelper } from "../utils/testHelpers.js";
import cookieParser from "cookie-parser";
import { access } from "fs";
import { faker } from "@faker-js/faker";
//handle clearing testing database befor each test
beforeAll(async()=>{
    console.log('initiall db clearing:- in progress')
    await prisma.$transaction([
        prisma.refreshToken.deleteMany(),
        prisma.userFriends.deleteMany(),
        prisma.comment.deleteMany(),
        prisma.post.deleteMany(),
        prisma.user.deleteMany(),



    ]);
    console.log('initiall db clearing:- Complete')
});
describe('/feed',()=>{
    //endpoints to test:-
    let user;
    let response;
    let accessToken;
    //create test user
    beforeAll(async()=>{
        //create fake user
        user = await prisma.user.create({
            data:{
                email: 'testing@email.com',
                name: 'test user',
                password: await bcrypt.hash('testing123',10) 
            }
        })
        //login user
        response = await request(app).post('/auth/login/local')
        .send({
            email:'testing@email.com', 
            password: 'testing123'
        })
        accessToken = response.body.accessToken;
    })
    //delete all users
    afterAll(async()=>{
        await prisma.$transaction([
            prisma.refreshToken.deleteMany(),
            prisma.userFriends.deleteMany(),
            prisma.comment.deleteMany(),
            prisma.post.deleteMany(),
            prisma.user.deleteMany()
        ]);
    })
    //- midware is endpoint protected
    testHelper.checkAuthProtection('feed',()=> accessToken)

    describe('feed endpoint content',()=>{
        beforeEach(async()=>{
            response = await request(app).get('/feed')
            .set('Authorization', `Bearer ${accessToken}`);
        })
        test('test',async()=>{

        })
    })
    //- GET/feed?limit={}               >get post feed with a set limit!
    //- GET/feed?cursor={}              >load new posts from last post number
    //- GET/feed/latest                 >get the most uptodate posts
})