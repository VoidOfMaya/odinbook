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
describe('/network',()=>{
    //endpoints to test:-
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
        //creates 5 users with relations to testing user
        // two records with ACTIVE statuse
        // one with PENDING status
        // one with DECLINED status
        // one with BLOCKED statuse
        records = await testHelper.populateFriendships(user.id)
        //create user without connections

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
    //- midware is a endpoint protected (ONLY Authenticated users can access)
    //console.log(userToken)
    testHelper.checkAuthProtection('network',()=>  userToken)
    describe('test validation layer',()=>{
        let errors;
        test('throws error if status is not defined',async()=>{
            response = await request(app).get('/network/connection')
            .set('Authorization', `Bearer ${userToken}`);
            
            errors = response.body.error;
            expect(response.status).toBe(400);
            expect(errors.message).toEqual('validation Error');
        })
        test('throws error if status is empty',async()=>{
            response = await request(app).get('/network/connection?status=')
            .set('Authorization', `Bearer ${userToken}`);
            
            errors = response.body.error;
            expect(response.status).toBe(400);
            expect(errors.message).toEqual('validation Error');
        })
        test('throws error if status is invalid',async()=>{
            response = await request(app).get('/network/connection?status=stuff')
            .set('Authorization', `Bearer ${userToken}`);
            
            errors = response.body.error;
            expect(response.status).toBe(400);
            expect(errors.message).toEqual('validation Error');
        })                    
    })
    //- GET/network/friends             >get a list of current users friends
    describe('get my friends: /network/connection?status=ACTIVE',()=>{
        //init fake users and friendship data
  
        test('endpoint accessed',async()=>{
            response = await request(app).get('/network/connection?status=ACTIVE')
            .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
        })
        test('return only active friendships',async()=>{
            const friends = response.body.friends

            expect(friends).toBeDefined();
            friends.forEach(friend =>{
                expect(friend.meta.status).toEqual("ACTIVE")
            })
        })
        test('no relation record duplicates',async()=>{
            const friends = response.body.friends
            //check for duplication
            const friendIds=[];
            friends.forEach(friend=>{
                expect(friendIds).not.toContain(friend.user.id);
                friendIds.push(friend.user.id);
            })
        })
    })
    describe('send connection request',()=>{
        //let records
        beforeEach(async()=>{
            records = await prisma.user.findMany();
        })

        test('input validation',async()=>{
            response = await request(app).post('/network/connection')
            .set('Authorization', `Bearer ${userToken}`)

            expect(response.status).toBe(400);          
        })
        test('send a connection request',async()=>{
            //setup fake new user with 0 connections
            const record = await prisma.user.create({
                data:{
                    email: "Mock@user.com",
                    name: "alice cooper",
                    password: "BANANA",
                    isPrivate: true,
                    bio: "ALL HAIL THE CLAW",
                },
                select:{
                    id: true,
                }
            })
            response = await request(app).post('/network/connection')
            .set('Authorization', `Bearer ${userToken}`)
            .send({recipiantId : record.id}) //last position
            
            expect(response.status).toBe(201);
            expect(response.body.connectionId).toBeDefined();

        }) 
        //if a connection already exists abort
        test('return 409 for already existing connections',async()=>{
            response = await request(app).post('/network/connection')
            .set('Authorization', `Bearer ${userToken}`)
            .send({recipiantId : records[1].id})
            expect(response.status).toBe(409);
        })

    })

    //- POST/network/request            >creates a friendship record set to PENDING
    describe('get friend request: /network/requests?status=PENDING',()=>{
        //init fake users and friendship data   
        test('endpoint accessed',async()=>{
            response = await request(app).get('/network/connection?status=PENDING')
            .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
        })
        test('return only active friendships',async()=>{
            const friends = response.body.friends
            expect(friends).toBeDefined();
            friends.forEach(friend =>{
                expect(friend.meta.status).toEqual("PENDING")
            })
        })
        test('no relation record duplicates',async()=>{
            const friends = response.body.friends
            //check for duplication
            const friendIds=[];
            friends.forEach(friend=>{
                expect(friendIds).not.toContain(friend.user.id);
                friendIds.push(friend.user.id);
            })
        })
    })

    //- PATCH/network/request/:{reqId}   >set friendship status{"ACTIVE","DECLINE","BLOCKED"}
    describe('change connection status: /network/connection/:id',()=>{
        let records;
        beforeEach(async()=>{
            records= await prisma.userFriends.findMany()
        })
        test('activate friendship',async()=>{
            response = await request(app).patch(`/network/connection/${records[1].id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({updateStatus: 'ACTIVE'});
            //console.log(response.body.error.details)
            expect(response.status).toBe(200);
        })
        test('block friendship',async()=>{

            response = await request(app).patch(`/network/connection/${records[0].id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({updateStatus: 'DECLINED'});
            //console.log(response.body)
            expect(response.status).toBe(200);
        })
        test('decline friendship',async()=>{

            response = await request(app).patch(`/network/connection/${records[2].id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({updateStatus: 'BLOCKED'});
            
            expect(response.status).toBe(200);
        })
    })
})