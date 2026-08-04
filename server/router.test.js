import request from "supertest";
import { app } from "./app.js";
import {prisma} from './lib/prisma.js'
import bcrypt from "bcryptjs";
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
        test('on wrong credintials',async()=>{})
        test('on empty request',async ()=>{})
    })
    //- POST/auth/login/google  >oauth strategy log in
    describe('/login/local ',()=>{
        describe('on success',()=>{
            //access token exists
            //req.user exists
            //refresh token and threadId cookies set
            //refreshtoken exists in db
            //last login updated            
        })
        test('on wrong user input', async()=>{})
        test('on empty request', async ()=>{})
    })
    //- POST/auth/refresh       >token refresh
    describe('/refresh', ()=>{
        //access token set
        //refresh token and threadId cookies set
        //refreshtoken exists in db
        //last login updated
        //if old token exists  becomes revoked
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