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
import { execPath } from "process";
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

    describe('post/:id/comment',()=>{
        //- POST/post/{id}/comment/newcomment     >create comment on a post by id
        test('comment on post',async()=>{
            response = await request(app).post(`/post/${myPost.id}/comment/newComment`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({comment: faker.lorem.sentence()})
            const comment = response.body.comment
            const commentInDb = await prisma.comment.findUnique({where:{id: comment.id}})
            
            expect(response.status).toBe(201);
            expect(commentInDb).toBeDefined();
            

        })
        //- GET/post/{id}/comments/commentlist?limit=3      >get post comments
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
        // -GET/post/{id}/comments/commentlist?limit=3&cursor={nextCursor}
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
            //map timestamps to validate the order of each comment
            const datesArray = commentsArray.map(comment => comment.createdAt);

            const isOrdered = datesArray.every((current, index, array)=>{
                return index === array.length-1 || current > array[index+ 1]
            })
            //console.log()
            expect(response.status).toBe(200);
            expect(commentsArray.length).toEqual(6);
            expect(isOrdered).toBe(true);

        })
    })
    describe('comment edit/delete',()=>{
        //- PATCH/comment{id}               >edit comment by id
        let comment;
        beforeAll(async()=>{
              
            response = await request(app).post(`/post/${myPost.id}/comment/newComment`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({comment: faker.lorem.sentence()})
            comment = response.body.comment
            
        })
        test('edit comment',async()=>{
            console.log(comment)
            response = await request(app).patch(`/comment/${comment.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                content: faker.lorem.sentence(),
            })

            expect(response.status).toBe(200);
            expect(response.body.comment.content).not.toEqual(comment.content);
        })
        test('like comment',async()=>{
            response = await request(app).patch(`/comment/${comment.id}/like`)
            .set('Authorization', `Bearer ${userToken}`)

            //validate like amnount in database
            const updatedComment = await prisma.comment.findUnique({
                where: {id: Number(comment.id)},
                select:{
                    likes: true,
                }
            })
            expect(response.status).toBe(200);
            expect(updatedComment.likes).toEqual(1);
            
        })       
        test('dislike comment',async()=>{
            response = await request(app).patch(`/comment/${comment.id}/dislike`)
            .set('Authorization', `Bearer ${userToken}`)

            //validate like amnount in database
            const updatedComment = await prisma.comment.findUnique({
                where: {id: Number(comment.id)},
                select:{
                    likes: true,
                }
            })
            expect(response.status).toBe(200);
            //returns zero because pervious test increased likes by 1
            expect(updatedComment.likes).toEqual(0);
        }) 
        //- delete/comment{id}              >delete comment by id  
        test('delete comment',async()=>{
            response = await request(app).delete(`/comment/${comment.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            expect(response.status).toBe(200)
        })       
    })

})