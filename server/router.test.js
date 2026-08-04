import request from "supertest";
import { app } from "./app.js";
import {prisma} from './lib/prisma.js'
//handle clearing testing database befor each test
beforeAll(async()=>{
    console.log('initiall db clearing:- in progress')
    await prisma.$transaction([
        prisma.user.deleteMany(),
        prisma.refreshToken.deleteMany(),
        prisma.post.deleteMany(),
        prisma.comment.deleteMany(),
        prisma.userFriends.deleteMany(),
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
    //endpoints to test:-
    //- POST/auth/Register      >registration
    describe('user registeration',()=>{
        beforeEach(async()=>{
            await prisma.user.deleteMany()
        })
        const user = {
            email:'example@email.com',
            name: 'john doe',
            password:'testing@123',
            confirmPassword: 'testing@123'
        }
        test('on  success', async()=>{
            const response = await request(app).post('/auth/register')
            .send(user)
            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: "User  registered successfully"
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
    })
    //- POST/auth/login/local   >local strategy log in 
    //- POST/auth/login/google  >oauth strategy log in
    //- POST/auth/refresh       >token refresh
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