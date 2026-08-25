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
describe('/comment',()=>{
    let user;
    let response;
    let userToken;
    let myPost;
    let otherPost;
    //create mock user
    beforeAll(async()=>{
        //create fake authenticated user
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
        userToken = response.body.accessToken;
        myPost = await prisma.post.create({
            data:{
                content: faker.lorem.paragraph(),
                authorId: user.id
            }
        })
    })
    //delete mock user
    afterAll(async()=>{
        await prisma.$transaction([
            prisma.refreshToken.deleteMany(),
            prisma.userFriends.deleteMany(),
            prisma.comment.deleteMany(),
            prisma.post.deleteMany(),
            prisma.user.deleteMany(),
        ]);
    })
    //endpoints to test:-
    //test authorization:-
    testHelper.checkAuthProtection('comment',()=>  userToken)
    //- PATCH/comment{id}               >edit comment by id
    //- delete/comment{id}              >delete comment by id  
    describe('post/:id/comment',()=>{

        test('comment on post',async()=>{
            response = await request(app).post(`/post/${myPost.id}/comment/`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({comment: faker.lorem.sentence()})
            const comment = response.body.comment
            const commentInDb = await prisma.comment.findUnique({where:{id: comment.id}})
            
            expect(response.status).toBe(201);
            expect(commentInDb).toBeDefined();
            

        })
        test('get post comments',async()=>{
            // input face comments
            const populateComment = async()=>{
                await request(app).post(`/post/${myPost.id}/comment/`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({comment: faker.lorem.sentence()})
            }
            /*
            await Promise.all([
                populateComment(),
                populateComment(),
                populateComment(),
                populateComment(),
                populateComment(),
                populateComment(),
            ]);
            */
            console.log(`Step1: test level ${myPost.id}`)
            response = await request(app).get(`/post/${myPost.id}/comment/`)
            .set('Authorization', `Bearer ${userToken}`)
            .query({
                limit: 3
            })

            expect(response.status).toBe(200);
        })
        //- POST/post/{id}/comment      >create comment on a post by id
        //- GET/post/{id}/comments      >get post comments
    })
})