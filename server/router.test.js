import request from "supertest";
import { app } from "./app.js";
import {prisma} from './lib/prisma.js'
import bcrypt from "bcryptjs";
import { jest } from '@jest/globals'

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
                const reqCookie = response.headers["set-cookie"];
                //parsing cookeis from request
                const refreshCookie =reqCookie.find(c=>c.startsWith('refreshToken='));
                const threadCookie =reqCookie.find(c=>c.startsWith('threadId='));
                //isolating cookie variables
                const refreshtoken = refreshCookie.split(";")[0].split("=")[1];
                const threadId = threadCookie.split(";")[0].split("=")[1];

                //get from db
                const token = await prisma.refreshToken.findUnique({
                    where:{token: refreshtoken}
                })
                console.log(`cookies:\n token:${refreshtoken}\nthreadId:${threadId}`)
                console.log(token)
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
    //- POST/auth/login/google  >oauth strategy log in
    describe('/login/google ',()=>{
        describe('on success',()=>{
            test('route exists',async()=>{
                const response = (await request(app).post('/auth/login/google'))
                expect(response.status).not.toBe(404)
            })
            //access token exists
            //req.user exists
            //refresh token and threadId cookies set
            //refreshtoken exists in db
            //last login updated            
        })
        describe('on faulty input',()=>{
            test('on wrong user input', async()=>{})
            test('on empty request', async ()=>{})            
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
                const refreshtoken = refreshCookie.split(";")[0].split("=")[1];
                const threadId = threadCookie.split(";")[0].split("=")[1];
                console.log(`UNALTERED COOKIES`)
                console.log(cookies)
                console.log(`PARSED COOKIES`)
                console.log(refreshtoken)
                console.log(threadId)
                //get from db
                const token = await prisma.refreshToken.findUnique({
                    where:{token: refreshtoken}
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
                const refreshtoken = refreshCookie.split(";")[0].split("=")[1];
                const threadId = threadCookie.split(";")[0].split("=")[1];
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

            console.log(response)
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
})
describe('/feed',()=>{
    //endpoints to test:-
    //- GET/feed?limit={}               >get post feed with a set limit!
    //- GET/feed?cursor={}              >load new posts from last post number
    //- GET/feed/latest                 >get the most uptodate posts
})
describe('/user',()=>{
    //endpoints to test:-
    //- GET/user/me                     >get my profile data
    //- PATCH/user/me                   >edit user profile data +  photo type files
    //- GET/user/{id}                   >get other users profile, if not private
    //- GET/user/{id}/posts             >get users posts
    //- GET/user?search={user}          >get a list of matching users
})
describe('/network',()=>{
    //endpoints to test:-
    //- GET/network/friends             >get a list of current users friends
    //- POST/network/request            >creates a friendship record set to PENDING
    //- PATCH/network/request/{reqId}   >set friendship status{"ACTIVE","DECLINE","BLOCKED"}
})
describe('/post',()=>{
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