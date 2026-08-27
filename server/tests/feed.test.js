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
    let fakeUsers;
    //create test user
    beforeAll(async()=>{
        //create fake currentuser
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
        //DATABASE SETUP
        //creating 3 fake user friends and posts with commentts
        fakeUsers = await prisma.$transaction([
            prisma.user.create({
                data:{
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    password: faker.internet.password()
                }
            }),
            prisma.user.create({
                data:{
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    password: faker.internet.password()
                }
            }),
            prisma.user.create({
                data:{
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    password: faker.internet.password()
                }
            }),
        ])
        //create fake friendship connections
        await prisma.$transaction([
            prisma.userFriends.create({
                data:{
                    userId: Number(user.id),
                    friendId: Number(fakeUsers[0].id),
                    status: "ACTIVE",
                }
            }),
            prisma.userFriends.create({
                data:{
                    userId: Number(fakeUsers[1].id),
                    friendId: Number(user.id),
                    status: "ACTIVE",
                }
            }),
        ])
        //create fake postings from each user

        //first user  4posts
        await prisma.$transaction([
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[0].id),
                    content: faker.lorem.paragraph()
                }
            }), 
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[0].id),
                    content: faker.lorem.paragraph()
                }
            }), 
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[0].id),
                    content: faker.lorem.paragraph()
                }
            }),
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[0].id),
                    content: faker.lorem.paragraph()
                }
            }) 
        ])
        //second user 4 posts
        await prisma.$transaction([
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[1].id),
                    content: faker.lorem.paragraph()
                }
            }), 
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[1].id),
                    content: faker.lorem.paragraph()
                }
            }), 
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[1].id),
                    content: faker.lorem.paragraph()
                }
            }),
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[1].id),
                    content: faker.lorem.paragraph()
                }
            }), 
        ])
        //third user 3 posts
        await prisma.$transaction([
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[2].id),
                    content: faker.lorem.paragraph()
                }
            }), 
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[2].id),
                    content: faker.lorem.paragraph()
                }
            }), 
            prisma.post.create({
                data:{
                    authorId: Number(fakeUsers[2].id),
                    content: faker.lorem.paragraph()
                }
            }), 
        ])

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
        test('first load',async()=>{
            response = await request(app).get(`/feed`)
            .set(`Authorization`, `Bearer ${accessToken}`)
            .query({
                limit: 2,
            })
            expect(response.status).toBe(200);
            expect(response.body.nextCursor).toBeDefined();
        })
        test('subsequent load',async()=>{
            let nextCursor;
            let postArray = []
            
            for(let i = 0; i < 3; i++){
                console.log(`next cursor: ${nextCursor}`)
                response = await request(app).get(`/feed`)
                .set('Authorization', `Bearer ${accessToken}`)
                .query({
                    limit: 2,
                    cursor: nextCursor || null
                })
                nextCursor = response.body.nextCursor
                response.body.feed.forEach(post=>{
                    postArray.push(post)
                })                
            }
            //map timestamps to validate the order of each comment
            const datesArray = postArray.map(post => post.createdAt);

            const isOrdered = datesArray.every((current, index, array)=>{
                return index === array.length-1 || current > array[index+ 1]
            })

            expect(response.status).toBe(200);
            expect(postArray.length).toEqual(6);
            //validate each feed post contains 3 preview comments
            postArray.forEach(post=>{
                expect(post.comments).toBeDefined();
            })
            //validate that no post is from fakeuser[2] 
            //who does not have active friendship with user
            const authorsArray = postArray.map(post => post.authorId);
            authorsArray.forEach(author=>{
                expect(author).not.toEqual(fakeUsers[2].id);
            })
            expect(isOrdered).toBe(true);
        })
    })
    //- GET/feed?limit={}               >get post feed with a set limit!
    //- GET/feed?cursor={}              >load new posts from last post number
    //- GET/feed/latest                 >get the most uptodate posts
})