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
describe('/user',()=>{
    //endpoints to test:-
    let user;
    let response;
    let userToken;
    //create mock user
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
    //- midware is endpoint protected
    testHelper.checkAuthProtection('user',()=>  userToken)
    
    //- GET/user/me                     >get my profile data
    describe('get user/me',()=>{
        beforeEach(async()=>{
            response = await request(app).get('/user/me')
            .set('Authorization', `Bearer ${userToken}`);
        })
        test('user endpoint valid',async()=>{
            const result = response;
            expect(result.status).toBe(200)
        })
        test('valid current user data format',async()=>{
            const result = response;
            const user = result.body.user;

            expect(user.name).toBeDefined();
            expect(user.bio).toBeDefined();
            expect(user.photo).toBeDefined();
            expect(user.isOnline).toBeDefined();
            expect(user.lastOnline).toBeDefined();
            expect(user.createdAt).toBeDefined();
            expect(user.email).not.toBeDefined();
           expect(user.password).not.toBeDefined();
           expect(user.githubId).not.toBeDefined();
        })
    })
    
    //- PATCH/user/me                   >edit user profile data +  photo type files
    describe('edit user/me',()=>{
        beforeEach(async()=>{
            response = await request(app).patch('/user/me')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name:'mark clark',
                bio:'edited in new bio',
                photo: ''
            })
        })
        test('returns newlly edited data',async()=>{
            const result = response
            expect(result.status).toBe(200)
        })
    })

    //- GET/user/{id}                   >get other users profile, if not private
    describe('user/:id',()=>{
        let publicUser;
        let privateUser;
        beforeAll(async()=>{
            //create a  public user and a private current user!
            publicUser = await prisma.user.create({
                data:{
                    email: 'public@email.com',
                    name: 'public user',
                    password: await bcrypt.hash('testing123@',10),
                    isPrivate: false,
                },
                select:{
                    id: true
                }
            })
            privateUser = await prisma.user.create({
                data:{
                    email: 'private@email.com',
                    name: 'private user',
                    password: await bcrypt.hash('testing123@32',10),
                    isPrivate: true, 
                },
                select:{
                    id: true
                }
            })           
        })
        afterAll(async()=>{
            await prisma.$transaction([
                prisma.refreshToken.deleteMany(),
                prisma.userFriends.deleteMany(),
                prisma.comment.deleteMany(),
                prisma.post.deleteMany(),
                prisma.user.delete({
                    where:{email: 'public@email.com'}
                }),
                prisma.user.delete({
                    where:{email: 'private@email.com'}
                }),
            ]);
        })

        test('able to get public members',async()=>{
            response = await request(app).get(`/user/${publicUser.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            
            expect(response.status).toBe(200);
        });
        test('throw 403 if authenticated user has no active frienship with requested user',async()=>{
            response = await request(app).get(`/user/${privateUser.id}`)
            .set('Authorization', `Bearer ${userToken}`) 
            
            expect(response.status).toBe(403);
        });
        test('friend can view private member resource',async()=>{
            //add private user as friend
            await prisma.userFriends.create({
                data:{
                    userId: Number(user.id),
                    friendId: Number(privateUser.id),
                    status: "ACTIVE"
                }
            })
            //execute resource request
            response = await request(app).get(`/user/${privateUser.id}`)
            .set('Authorization', `Bearer ${userToken}`) 
            
            expect(response.status).toBe(200);
        })
    })

    //- GET/user?search={user}          >get a list of matching users
    describe('user/search?name={username}',()=>{
        const userIdArray = [];// serves as index for users to delete afte test if required
        beforeAll(async()=>{
            //create fake users to test search
            const users = await Promise.all([
            testHelper.createFakeUser('alex', 'alex@gmail.com', 'zaq1xsw2'),
            testHelper.createFakeUser('avidia', 'david@gmail.com', 'zaq1xsw2'),
            testHelper.createFakeUser('john', 'john@gmail.com', 'zaq1xsw2'),
            ])
            userIdArray.push(...users)
        })
        test('searches and display only users with letter a',async()=>{
            response = await request(app).get('/user/search?name=a')
            .set('Authorization', `Bearer ${userToken}`)

            expect(response.status).toBe(200);

            const matchingUsers = response.body.users;
            //console.log(matchingUsers);
            //console.log(userIdArray[2]);
            matchingUsers.forEach(user=>{
                expect(user.id).not.toEqual(userIdArray[2])
            })

        });
        test('if no such user found through a 404',async()=>{
            response = await request(app).get('/user/search?name=j')
            .set('Authorization', `Bearer ${userToken}`)

            expect(response.status).toBe(200);

            const matchingUsers = response.body.users;

            matchingUsers.forEach(user=>{
                expect(user.id).toEqual(userIdArray[2]);
                expect(user.id).not.toEqual(userIdArray[0]);
                expect(user.id).not.toEqual(userIdArray[1]);
            })


        });
        test('if query is invalid data throguh 404 error',async()=>{
            response = await request(app).get('/user/search?name=al')
            .set('Authorization', `Bearer ${userToken}`)

            expect(response.status).toBe(200);
            const matchingUsers = response.body.users;
            matchingUsers.forEach(user=>{
                expect(user.id).toEqual(userIdArray[0]);
                expect(user.id).not.toEqual(userIdArray[1]);
                expect(user.id).not.toEqual(userIdArray[2]);
            })
        }); 
        test('handle no users found!',async()=>{
            response = await request(app).get('/user/search?name=muratina')
            .set('Authorization', `Bearer ${userToken}`)

            expect(response.status).toBe(200);
            const matchingUsers = response.body.users;
            expect(matchingUsers).toEqual([]);
        });       
    })
})