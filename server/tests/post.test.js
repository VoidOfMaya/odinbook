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
describe('/post',()=>{
    let user;
    let response;
    let userToken;
    let records;
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
    testHelper.checkAuthProtection('post',()=>  userToken)
    //  POST/post                       >create post where current user is author
    let post;
    describe('post creation',()=>{
        test('sending post with no photo',async()=>{
            response = await request(app).post('/post')
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                photo: null,
                content: faker.lorem.paragraph()
            });
            post = response.body.post;
            expect(response.status).toBe(201)            
        })
    })
    //  PATCH/post/{id}                 >edit post at id  where current user is author
    describe('updating existing post',()=>{
        //create fake posts made by user for testing editing functionality
        test('sending post with no photo',async()=>{
            const newContent = faker.lorem.paragraph();
            response = await request(app).patch(`/post/${post.id}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                photo: null,
                content: newContent
            });
            const updatedPost = response.body.post;
            expect(response.status).toBe(200)
            expect(updatedPost.content).toEqual(newContent)
            expect(updatedPost.updatedAt).not.toEqual(updatedPost.createdAt)          
        })

    })
    //  GET/post/{id}                   >get post by id
    describe('get single post by id',()=>{
        test('get post',async()=>{
            response= await request(app).get(`/post/${post.id}`)
            .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(200);
            expect(response.body.post.id).toEqual(post.id);
        })
    })
    //  POST/post/{id}/reaction             >like a post
    describe('interact with post',()=>{
        test('like a post!',async()=>{
            response = await request(app).patch(`/post/${post.id}/like`)
            .set('Authorization', `Bearer ${userToken}`);
             
            expect(response.status).toBe(200);
            
            const postLikes = await prisma.post.findUnique({
                where:{id: Number(post.id)},
                select:{
                    likes: true
                }
            })
            expect(postLikes.likes).toEqual(1);
        })
        
        test('dislike post',async()=>{
            //first dislike call
            response = await request(app).patch(`/post/${post.id}/dislike`)
            .set("Authorization", `Bearer ${userToken}`)
            expect(response.status).toBe(200)
            //second dislike call post should have -1
            await request(app).patch(`/post/${post.id}/dislike`)
            .set("Authorization", `Bearer ${userToken}`)

            const postLikes = await prisma.post.findUnique({
                where:{id: Number(post.id)},
                select:{
                    likes: true
                }
            })
            expect(postLikes.likes).toEqual(-1);
        })
    })
    //  DELETE/post/{id}                >delete post by id "remove content and author name"
    describe('delete post by id',()=>{
        test('post deleted', async()=>{
            response = await request(app).delete(`/post/${post.id}`)
            .set('Authorization', `Bearer ${userToken}`)

            expect(response.status).toBe(200);
            expect(response.body.message).toEqual('Post Deleted');

            const deletedPost = await prisma.post.findUnique({
                where:{id: Number(post.id)}
            })
            expect(deletedPost).toBe(null);
        })
    })
    //NESTED ROUTES
    //- GET/user/{id}/posts             >get users posts
        describe('user/:id/posts',()=>{
            test('only authorized members can view',async()=>{
                response = await request(app).get(`/user/${user.id}/posts`)
                expect()
            });
            test('if private only authorized members that are friends can view',async()=>{});        
        })
})