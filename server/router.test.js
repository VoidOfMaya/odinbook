import request from "supertest";
import { app } from "./app.js";
import {prisma} from './lib/prisma.js'
import bcrypt from "bcryptjs";
import crypto from 'crypto'
import { afterAll, beforeEach, describe, expect, jest } from '@jest/globals'
import { testHelper } from "./utils/testHelpers.js";
import cookieParser from "cookie-parser";
import { access } from "fs";

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

describe('GET/health',()=>{
    test('checks server health endpoint', async()=>{
        const response =await request(app).get('/health')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ status: 'ok' })

    })
})
describe('/auth router',()=>{
    const user = {
        email:'example@email.com',
        name: 'john doe',
        password:'testing@123',
        confirmPassword: 'testing@123'
    }
    //endpoints to test:-
    //- POST/auth/Register      >registration
    describe('/register',()=>{
        beforeEach(async()=>{
            await prisma.user.deleteMany()
        })
  
        describe('on  success',()=>{
            test('user registered successfully', async()=>{
                const response = await request(app).post('/auth/register')
                .send(user)
                expect(response.status).toBe(201)
                expect(response.body).toEqual({
                    message: "User  registered successfully"
                }) 
            }) 
            test('password hashed in storage',async()=>{
                const response = await request(app).post('/auth/register')
                .send(user)
                const dbUser = await prisma.user.findUnique({
                    where:{email: user.email}
                })
                const match = await bcrypt.compare(user.password, dbUser.password);
                expect(match).toBe(true)
            })          
        })
        describe('on faulty input',()=>{
            test('on incomplete data',async ()=>{
                const response = await request(app).post('/auth/register')
                .send({...user, confirmPassword:"different password"})
                expect(response.status).toBe(400)
                expect(response.body).toEqual({
                    error: {
                        message: "validation Error",
                        details: [{
                                location: "body", 
                                msg: "passwords do not match", 
                                path: "confirmPassword", 
                                type: "field", 
                                value: "different password"
                            }]}
                })                
            })
            test('on registering with a duplicate email',async ()=>{
                //first send
                await request(app).post('/auth/register').send(user)
                //duplicate send
                const response = await request(app).post('/auth/register').send(user)
                expect(response.status).toBe(409)
            })            
        })

    })
    //- POST/auth/login/local   >local strategy log in 
    describe('/login/local ',()=>{
        beforeEach(async()=>{
            const sessions = await prisma.refreshToken.findMany();
            const users = await prisma.user.findMany()
        })

        describe('on success',()=>{
            let response;
            beforeEach(async()=>{
                await request(app).post('/auth/register')
                .send(user)
                response = await request(app).post('/auth/login/local')
                .send({
                    email:user.email, 
                    password: user.password
                })
            })
            test('returns valid status',()=>{
                expect(response.status).toBe(200)
            })
            //req.user exists            
            test('req.user exists',()=>{
                expect(response.body.user).toBeDefined()
            })
            //access token exists
            test('access token exists',()=>{
                expect(response.body.accessToken).toBeDefined();
            })
            //refresh token and threadId cookies set
            test('refresh token and threadId Cookies set',()=>{
                expect(response.headers["set-cookie"]).toEqual(
                    expect.arrayContaining([
                        expect.stringContaining("refreshToken="),
                        expect.stringContaining("threadId="),
                    ])
                )
            })
            //refreshtoken exists in db
            test('refresh token exists in database',async()=>{
                //parsing signed cookie  from request
                const setCookie = response.headers["set-cookie"];

                const refreshCookie =setCookie.find(c=>c.startsWith('refreshToken='));
                const threadCookie =setCookie.find(c=>c.startsWith('threadId='));
               const refreshToken = testHelper.decodeSignedCookie(refreshCookie);
               const threadId = testHelper.decodeSignedCookie(threadCookie);
                //get from db
                const token = await prisma.refreshToken.findUnique({
                    where:{token: refreshToken}
                })
                //console.log(`cookies:\n token:${refreshToken}\nthreadId:${threadId}`)
                expect(token).toBeDefined()
                expect(token.threadId).toEqual(threadId)
            })
            //last login updated  
            test('last login updated',async()=>{
                const record = await prisma.user.findUnique({
                    where:{email: user.email}
                })
                const now = new Date()
                const validDate = 
                    record.lastOnline.getTime() >= now.getTime() - 5000&& 
                    record.lastOnline.getTime()  <= now.getTime() + 5000
                expect(record.lastOnline).toBeDefined();
                expect(validDate).toBe(true);
            })          
        })
        describe('on faulty input',()=>{
            beforeEach(async()=>{
                await request(app).post('/auth/register')
                .send(user)                
            })
            test('on wrong credintials',async()=>{
                const response = await request(app).post('/auth/login/local')
                .send({
                    email: 'userDoesnoeExist@gmail.com',
                    password: 'completelyFakePassword'
                })

                expect(response.status).toBe(401)
                expect(response.body.error).toEqual('invalid login')
            })
            test('on empty request',async ()=>{
                const response = await request(app).post('/auth/login/local')
                expect(response.status).toBe(400)
            })            
        })

    })
    //- POST/auth/login/github  >oauth strategy log in
    describe('/login/github ',()=>{
        describe('on success',()=>{
            test('route exists',async()=>{
                const response = (await request(app).get('/auth/login/github'))
                expect(response.status).not.toBe(404)
            })
        })
        describe('on faulty input',()=>{
            test('on wrong user input', async()=>{})
            test('on empty request', async ()=>{})            
        })

        describe('step A generate unguessable state',()=>{
            //generates 32 cryptographic state
            let response;
            let cookies;
            beforeEach(async()=>{
                response= await request(app).get('/auth/login/github/state')
                cookies = response.headers["set-cookie"]
                global.fetch = jest.fn();
            })
            test(`has state`,async()=>{
                
                const stateCookie = cookies.find(c=>c.startsWith('state='));
                const state = testHelper.decodeSignedCookie(stateCookie);

                expect(state).toBeDefined()
                expect(state).toMatch(/^[0-9a-fA-F]{64}$/)
                expect(Buffer.from(state, 'hex')).toHaveLength(32)
            })
            //constructs query
            test('has a valid query',async()=>{
                const query = response.body.query

                expect(query).toContain(`client_id=`);
                expect(query).toContain(`redirect_uri=`);
                expect(query).toContain(`state=`);
                expect(query).toContain(`scope=`);
            })
            //cookies are signed and httpOnly
            test('state gets sent as a signed cookie',async()=>{})
        })
        describe('step B callback ',()=>{
            let response;
            let cookies;
            let codeResponse;
            beforeEach(async()=>{
                //generates state strate:
                const state = crypto.randomBytes(32).toString('hex')
                global.fetch = jest.fn();
                
                testHelper.mockOauth({state: state});
                response = await request(app).get('/auth/login/github/cb')
                cookies = response.headers["set-cookie"]
            })
            test('validate user id in signedCookie',async()=>{
                const userCookie = cookies.find(c=>c.startsWith('userId='));
                const cleanUserId = testHelper.decodeSignedCookie(userCookie)

                const result = await response

                expect(userCookie).toContain("userId=s%3A")
                expect(cleanUserId).toBeDefined()
                expect(typeof cleanUserId).toBe('string')
            })
          test('validate redirect link',async()=>{
                const userCookie = cookies.find(c=>c.startsWith('userId='));
                const cleanUserId = testHelper.decodeSignedCookie(userCookie)
                
                const result = await response
                //console.log(userCookie)
                expect(result.status).toBe(302)
                expect(result.headers.location).toEqual('http://localhost:5173/login/github');
          })
          test('user exists in the database',async()=>{
                const userCookie = cookies.find(c=>c.startsWith('userId='));
                const cleanUserId = testHelper.decodeSignedCookie(userCookie)

                const user = await prisma.user.findUnique({where: {id: Number(cleanUserId)}});

                expect(user).toBeDefined();
          })
        })
        describe('step C login with github account',()=>{
            let cookies;
            let response;
            beforeEach(async()=>{
                // run step A of Oauth flow: generate state and auth query
                const state = crypto.randomBytes(32).toString('hex')
                global.fetch = jest.fn();
                // run step B of Oauth flow: authenticate via github return userId
                testHelper.mockOauth({state: state});
                const auth = await request(app).get('/auth/login/github/cb')
                cookies = auth.headers["set-cookie"]
                // run step C of Oauth flow: preform user login via cusom auth system
                response = await request(app).get('/auth/login/github')
                .set('Cookie',cookies);
                cookies = response.headers["set-cookie"]
            })
            test('returns user in request',async()=>{
                const userCookie = cookies.find(c=>c.startsWith('userId='));
                const cleanUserId = testHelper.decodeSignedCookie(userCookie)
                //const user = await prisma.user.findUnique({where: {id: Number(cleanUserId)}});
                const result = await response;
               //console.log(result);
                expect(result.body.user).toBeDefined();
            })
            test('returns valid status',()=>{
                expect(response.status).toBe(200)
            })
            //access token exists
            test('access token exists',()=>{
                expect(response.body.accessToken).toBeDefined();
            })
            //refresh token and threadId cookies set
            test('refresh token and threadId Cookies set',()=>{
                expect(response.headers["set-cookie"]).toEqual(
                    expect.arrayContaining([
                        expect.stringContaining("refreshToken="),
                        expect.stringContaining("threadId="),
                    ])
                )
            })
            //refreshtoken exists in db
            test('refresh token exists in database',async()=>{
                //parsing signed cookie  from request
                const setCookie = response.headers["set-cookie"];

                const refreshCookie =setCookie.find(c=>c.startsWith('refreshToken='));
                const threadCookie =setCookie.find(c=>c.startsWith('threadId='));
               const refreshToken = testHelper.decodeSignedCookie(refreshCookie);
               const threadId = testHelper.decodeSignedCookie(threadCookie);
                //get from db
                const token = await prisma.refreshToken.findUnique({
                    where:{token: refreshToken}
                })
                //console.log(`cookies:\n token:${refreshToken}\nthreadId:${threadId}`)
                expect(token).toBeDefined()
                expect(token.threadId).toEqual(threadId)
            })
            //last login updated  
            test('last login updated',async()=>{
                const record = await prisma.user.findUnique({
                    where:{email: user.email}
                })
                const now = new Date()
                const validDate = 
                    record.lastOnline.getTime() >= now.getTime() - 5000&& 
                    record.lastOnline.getTime()  <= now.getTime() + 5000
                expect(record.lastOnline).toBeDefined();
                expect(validDate).toBe(true);
            }) 
        })

    })
    //- POST/auth/refresh       >token refresh
    describe('/refresh', ()=>{
        let cookies;
        beforeEach(async()=>{
            await prisma.refreshToken.deleteMany();
            //register user
            await request(app).post('/auth/register')
            .send(user)
            //login as user
            const login = await request(app).post('/auth/login/local')
            .send({
                    email:user.email, 
                    password: user.password
                }) 
            // Extracting login cookies
            cookies = login.headers["set-cookie"];
        })
        describe('on 1 refresh success',()=>{
            let response;
            beforeEach(async()=>{
                response = await request(app).post('/auth/refresh')
                .set('Cookie',cookies);
                cookies = response.headers["set-cookie"]
            })
            test('path is valid',()=>{
                expect(response.status).toBe(201);
            })  
            test('access token returned',()=>{
                expect(response.body.accessToken).toBeDefined()
            })
            test('refresh token and threadId Cookies set',()=>{
                expect(response.headers["set-cookie"]).toEqual(
                    expect.arrayContaining([
                        expect.stringContaining("refreshToken="),
                        expect.stringContaining("threadId="),
                    ])
                )
            })
            //refreshtoken exists in db
            test('a valid refresh token exists in database',async()=>{
                //parsing cookeis from request
                const refreshCookie =cookies.find(c=>c.startsWith('refreshToken='));
                const threadCookie =cookies.find(c=>c.startsWith('threadId='));

                //isolating cookie variables
                const refreshToken = testHelper.decodeSignedCookie(refreshCookie);
                const threadId = testHelper.decodeSignedCookie(threadCookie)
                //get from db
                const token = await prisma.refreshToken.findUnique({
                    where:{token: refreshToken}
                })
                const tokens = await prisma.refreshToken.findMany({
                    where:{threadId: threadId}
                })
                const isRevoked = token.revoked
                expect(token).toBeDefined()
                expect(isRevoked).toBe(false)
                expect(token.threadId).toEqual(threadId)
            })        
        })
        describe('on multiple refreshes success',()=>{
            let response;
            beforeEach(async()=>{
                for(let i = 0; i <= 3; i++){
                    response = await request(app).post('/auth/refresh')
                    .set('Cookie',cookies);
                    cookies = response.headers["set-cookie"]                    
                }
            })
            test('only 1 valid token exists per threadId',async()=>{
                //parse current token from cookies
                //parsing cookeis from request
                const refreshCookie =cookies.find(c=>c.startsWith('refreshToken='));
                const threadCookie =cookies.find(c=>c.startsWith('threadId='));
                //isolating cookie variables
                const refreshtoken = testHelper.decodeSignedCookie(refreshCookie)
                const threadId = testHelper.decodeSignedCookie(threadCookie);
                //get all cookies
                const allTokens = await prisma.refreshToken.findMany({
                    where:{threadId: threadId}
                });
                const validTokensCount = allTokens.filter(token=>token.revoked === false)
                expect(validTokensCount.length).toEqual(1)
            })

        })
        describe('on conccurent refresh success',()=>{
            let response;
            beforeEach(async()=>{
                const requests = [];
                for(let i = 0; i <= 3; i++){
                    requests.push(
                        request(app).post('/auth/refresh')
                        .set('Cookie',cookies) 
                    )                   
                }
                response= await Promise.all(requests)
                
                //cookies = response[-1].headers["set-cookies"]
            })
            test('only 1 valid token exists per threadId',async()=>{
                const allTokens = await prisma.refreshToken.findMany();
                const validTokensCount = allTokens.filter(token=>token.revoked === false)
               response.forEach(res=>{
                    expect(res.status).toBe(201)
                })
                
                expect(allTokens.length).toEqual(2)
                expect(validTokensCount.length).toEqual(1)

            })
        })
        //last login updated
        //helper time delay function
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        test('updated last login update', async()=>{  

            await delay(3000)
            const response = await request(app).post('/auth/refresh')
                .set('Cookie',cookies);

            const record = await prisma.user.findUnique({
                where:{email: user.email}
            })
            const now = new Date()
            const validDate = 
                record.lastOnline.getTime() >= now.getTime() - 1000&& 
                record.lastOnline.getTime()  <= now.getTime() + 1000
            expect(record.lastOnline).toBeDefined();
            expect(validDate).toBe(true);
        });
    })
    //- POST/auth/logout        >logout
    describe('/logout',()=>{
        let cookies;
        beforeEach(async()=>{
            await prisma.refreshToken.deleteMany();
            //register user
            await request(app).post('/auth/register')
            .send(user)
            //login as user
            const login = await request(app).post('/auth/login/local')
            .send({
                    email:user.email, 
                    password: user.password
                }) 
            // Extracting login cookies
            cookies = login.headers["set-cookie"];
        })
        //check online status is offline
        test('is_online status is false',async()=>{
            const response = await request(app).delete('/auth/logout')
            .set('Cookie',cookies)
            cookies = response.headers["set-cookie"]
            
            //console.log(response.body)
            const userRecord = await prisma.user.findUnique({
                where:{email: user.email}
            })
            expect(userRecord.isOnline).toBe(false)
        })
        //cookies empty
        test('cookies are cleared from storage',async()=>{
            const response = await request(app).delete('/auth/logout')
            .set('Cookie',cookies)
            cookies = response.headers["set-cookie"]
            //console.log(cookies)
            expect(cookies).not.toBeDefined()
        })

    })

    
})
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
            console.log(userToken);
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
            console.log(result)
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
    describe('user/?search={username}',()=>{

        test('searches user by looking up if character name exists',async()=>{});
        test('if no such user found through a 404',async()=>{});
        test('if query is invalid data throguh 404 error',async()=>{});        
    })
})
describe('/network',()=>{
    
    //endpoints to test:-
    //- GET/network/friends             >get a list of current users friends
    //- POST/network/request            >creates a friendship record set to PENDING
    //- PATCH/network/request/{reqId}   >set friendship status{"ACTIVE","DECLINE","BLOCKED"}
})
describe('/post',()=>{
    //- GET/user/{id}/posts             >get users posts
        describe('user/:id/posts',()=>{
            test('only authorized members can view',async()=>{});
            test('if private only authorized members that are friends can view',async()=>{});        
        })
        
    //endpoints to test:-
    //  POST/post                       >create post where current user is author
    //  PATCH/post/{id}                 >edit post at id  where current user is author
    //  GET/post/{id}                   >get post by id
    //  POST/post/{id}/like             >like a post
    //  DELETE/post/{id}/like           >dislike a post
    //  DELETE/post/{id}                >delete post by id "remove content and author name"
    describe('post/:id/comment',()=>{
        //- POST/post/{id}/comment      >create comment on a post by id
        //- GET/post/{id}/comments      >get post comments
    })
})
describe('/comment',()=>{
    //endpoints to test:-
    //- PATCH/comment{id}               >edit comment by id
    //- delete/comment{id}              >delete comment by id  
})
