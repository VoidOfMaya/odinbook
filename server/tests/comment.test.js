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
        beforeAll(async()=>{

        })
        test('comment on post',async()=>{
            response = await request(app).post(`/post/${myPost.id}/comment/newComment`)
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
                await request(app).post(`/post/${myPost.id}/comment/newComment`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({comment: faker.lorem.sentence()})
            }
            
            await Promise.all([
                populateComment(),
                populateComment(),
                populateComment(),
                populateComment(),
                populateComment(),
                populateComment(),
            ]);

            console.log(`Step1: test level ${myPost.id}`)
            response = await request(app).get(`/post/${myPost.id}/comment/commentlist`)
            .set('Authorization', `Bearer ${userToken}`)
            .query({
                limit: 3
            })

            expect(response.status).toBe(200);
            expect(response.body.comments).toBeDefined();
            expect(response.body.nextCursor).toBeDefined();
        })
        test('comment pagination',async()=>{

            let nextCursor;
            let commentsArray = []
            
            for(let i = 0; i < 3; i++){
                console.log(`next cursor: ${nextCursor}`)
                response = await request(app).get(`/post/${myPost.id}/comment/commentlist`)
                .set('Authorization', `Bearer ${userToken}`)
                .query({
                    limit: 2,
                    cursor: nextCursor || null
                })
                nextCursor = response.body.nextCursor
                response.body.comments.forEach(comment=>{
                    commentsArray.push(comment)
                })                
            }
            const datesArray = commentsArray.map(comment => comment.createdAt);
            console.log(datesArray)
            const isOrdered = datesArray.every((current, index, array)=>{
                return index === array.length-1 || current > array[index+ 1]
            })
            //console.log()
            expect(response.status).toBe(200);
            expect(commentsArray.length).toEqual(6);
            expect(isOrdered).toBe(true);

        })
        //- POST/post/{id}/comment      >create comment on a post by id
        //- GET/post/{id}/comments      >get post comments
    })
})