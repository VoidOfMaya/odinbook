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

## Routes
-   **authRouter**
```
    []  POST/auth/login/{method}        >log in with username and password
    []  POST/auth/Register              >register a local user
    []  POST/auth/refresh               >refresh user authenticaiton
    []  POST/auth/logout                > logout user from session
```
-   **feedRouter**
```
    []  GET/feed?limit={}               >get users feed posts with a set quantity
    []  GET/feed?cursor={}              >get users feed posts from the cursor point   
    []  GET/feed/latest                 >get users feed newest posts
```
-   **userRouter**
```
    []  GET/user/me                     >get current users profile
    []  PATCH/user/me                   >edit current users profile
    []  GET/user/{id}                   >get other users profile, if not private
    []  GET/user/{id}/posts             >get users posts
    []  GET/user?search={user}          >get a list of matching users
```
-   **networkRouter**
```
    []  GET/network/friends             >get a list of current users friends
    []  POST/network/request            >creates a friendship record set to PENDING
    []  PATCH/network/request/{reqId}   >set friendship status{"ACTIVE","DECLINE","BLOCKED"}
```
-   **postRouter**
```
    []  POST/post                       >create post where current user is author
    []  PATCH/post/{id}                 >edit post at id  where current user is author
    []  GET/post/{id}                   >get post by id
    []  POST/post/{id}/like             >like a post
    []  DELETE/post/{id}/like           >dislike a post
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
## MiddleWare
    []  isAuthenticated()
    []  isAuthorized()
## Error handelling
## Authentication
## Controllers
## Services
## Input Validation