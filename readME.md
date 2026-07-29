# odin book {work in progress}
odin book is the final project in the odinbooks node.js course
and is a social media clone!
## tech & tools
|Frontend        |Backend      |Database      |Authentication          |Storage       |
|----------------|-------------|--------------|------------------------|--------------|
|React           |Node.js      |PostgreSQL    |Jwt                     |Cloudinary    |
|React Router    |Express      |Prisma ORM    |Refresh token rotation  |              |
|CSS Modules     |passport.js  |              |HttpOnly Cookies        |              |
|Vite            |Socket.IO    |              |                        |              |

## app pages:-
-    login/signup page
-    feed page (default page on authentication)
-    user profile page
-    user search page
-    404 error page
## Mvp Features:-
1- protect app access behind a signup/login page<br/>
2- user authentication through a method of choice (Oauth2/local-strategy) <br/>
3- user functionality:-<br/>
```
    -    send/recieve friend requests
    -    posts with full crud operations
    -    like a post
```
4- Posts contain and display:-<br/>
```
    - content
    - author
    - comments
    - likes
```
5- feed page that displays all posts from user and their friend network<br/>
6- user profile page containing:-<br/>
```
    - user info
    - user photo
    - user post timeline/history
    - if authenticated with Oauth populate
        profile with available data from Oauth
```
7- user search page to find all users <br/>
```
    - view user profile
    - enable send friend request options for users not in the network
    - display request status! for users that are in the network
```
## extra credit
1- allow posts to have images<br/>
2- allow users to update their profile photo<br/>
3- allow a guest sign in function for visitors to bypass the log in screen<br/>
    without creating an account<br/>
4- make it pretty<br/>

## entity data model:
|user       |Friendship |post       |comments   | status (enum) |refreshTpken   |
|-----------|-----------|-----------|-----------|---------------|---------------|
|id         |id         |id         |id         |PENDING        |id             |
|email      |status     |content    |content    |ACTIVE         |threadId       |
|password   |userId     |photo      |author     |BLOCKED        |token          |
|name       |friendId   |author     |createdAt  |               |expiresAt      |
|bio ?      |           |createdAt  |likes      |               |createdAt      |
|photo?     |           |likes      |parentId?  |               |revoked        |
|isOnline   |           |comments   |postId     |               |revokedAt      |
|createdAt  |           |visibility |           |               |graceUntill    |
|token      |           |           |           |               |userId         |
## authentication:-
authentication system is based off of the RTR authentication system implemented in [chatter app](https://github.com/VoidOfMaya/Chatter-front),additionally implements the callApi fetch wrapper to handle reauthentication and centralizing fetch data that works with the RTR system
## socket.io and live data:-
live data updates will handle the following function:-
-    online presence =>update on friends feed
-    post creation => indicate new post available to friends viewing feed or users profile
-    comments creation=> update users viewing post + comment number on friends viewing feed
-    post reactions => update users where post is viewable
-    user edits their profile photo=> update on friends feed
## feed generation:-
feed is the collection of friends a user has , that are used to populate and order a list of posts by time and date,
- additionally allow for infinite scroll behavior where once a user hits the bottom of a           component it will trigger the server to load and send an additional chunk of posts to allow      for infinite scrolling
- a feature that notifies user to go to the top of the feed and load the new posts made by friends
