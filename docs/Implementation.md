# Server Implementaiton plan
## Setup
-   import auth system frop chatter
-   implement minimal database requirment for the RTR system
-   adjust authentication to work with passport-github2 strategy
-   import socket auth from chater

---
### .env CORS handeling
-   implement cors handeling for local development and production
### Seed & Migration
-   seed data with Faker module form npm
---
## Database()
|user       |Friendship     |post       |comments   | status (enum) |refreshToken   |
|-----------|---------------|-----------|-----------|---------------|---------------|
|id  PK     |id  PK         |id  PK     |id  PK     |PENDING        |id  PK         |
|email      |status         |content    |content    |ACTIVE         |threadId       |
|password   |userId  FK     |photo      |author     |BLOCKED        |token          |
|name       |friendId  FK   |author     |createdAt  |DECLINED       |expiresAt      |
|bio ?      |               |createdAt  |likes      |               |createdAt      |
|photo?     |               |likes      |parentId?FK|               |revoked        |
|isOnline   |               |visibility |postId     |               |revokedAt      |
|createdAt  |               |editedAt   |editedAt   |               |graceUntill    |
|token      |               |           |           |               |userId FK      |
|isPrivate  |               |           |           |               |               |
|githubId   |               |           |           |               |               |
|lastOnline |               |           |           |               |               |

## Routes
-   **authRouter**
```
    [X]  GET/authlogin/github/state      >generates unguesable state and creates authorizartion request query
    [X]  GET/auth/login/github/cb        >gets github accesstoken, gets github user profile, finds or creates record of user
    [X]  GET/auth/login/github           > gets user recordand forwards to client
    [X]  POST/auth/Register              >register a local user
    [X]  POST/auth/refresh               >refresh user authenticaiton
    [X]  POST/auth/logout                > logout user from session

```
-   **feedRouter**
```
    []  GET/feed?limit={}               >get users feed posts with a set quantity
    []  GET/feed?cursor={}              >get users feed posts from the cursor point   
    []  GET/feed/latest                 >get users feed newest posts
```
-   **userRouter**
```
    [X]  GET/user/me                     >get current users profile
    [X]  PATCH/user/me                   >edit current users profile
    [X]  GET/user/{id}                   >get other users profile, if not private
    [PENDING]  GET/user/{id}/posts             >get users posts
    [X]  GET/user?search={user}          >get a list of matching users
```
-   **networkRouter**
```
    [X]  GET/network/connection?status=ACTIVE   >get a list of user connections
    [X]  POST/network/connect                >creates a friendship record set to PENDING
    [X]  PATCH/network/connection/{reqId}       >set friendship status{"ACTIVE","DECLINE","BLOCKED"}
```
-   **postRouter**
```
    [X]  POST/post                       >create post where current user is author
    [X]  PATCH/post/{id}                 >edit post at id  where current user is author
    [X]  GET/post/{id}                   >get post by id
    [X]  PATCH/post/{id}/like            >like a post
    [X]  PATCH/post/{id}/dislike         >dislike a post
    []  DELETE/post/{id}                >delete post by id "remove content and author name"
    -   nested comments resource
    []  POST/post/{id}/comment          >create comment on a post by id
    []  GET/post/{id}/comments          >get post comments
```
-   **commentRouter**
```
    []  PATCH/comment{id}               >edit comment by id
    []  delete/comment{id}              >delete comment by id  
```
## Socket Events 
## MiddleWare
    []  isAuthenticated()
    []  is cookieSigned()
    []  isAuthorized()
## Error handelling
Error handling is globalized to the following code:
```js
app.use((err, req, res, next) => {
    const logErr = !(err instanceof ApiError) || err.log
    if(logErr){
        console.error({
            message: err.message,
            method: req.method,
            path: req.originalUrl,
            stack: err.stack,
        });
    }

    return res.status(err.status || 500).json({
        error:{
            message: err.message || "Internal Server Error",
            details: err.details ?? null
        }
  });
});

```
to stanardize the error body an `ApiError`function is utilized that enherits/extends the `Error` object: 
```js
export class ApiError extends Error {
    constructor(status, message, details = null,log = false) {
        super(message);
        this.status = status;
        this.details = details;
        this.log = log;
    }
}

```
api error is called when wanting to pass on an error object to the global error catcher on app.js, usage example:
```js
if(dataExists){
    //do something
}else{
    //implementation:-
    throw new ApiError(
        500,                //statusCode
        "error message",    //error message
        errors.array(),     //error details
    )
}
```
## Authentication
 this app uses both a local method to user authentication and 
 githubs Oauth2.0 flow to authenticate users:-
 <img src='./images/secure git Oauth flow.jpg'/>
 and a custom refresh token rotation system
    - for security all cookies handeling authentication are signed with a cryptographically generated secret key

## Controllers
## Services
## Input Validation