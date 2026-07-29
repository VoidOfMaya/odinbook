# odin book {work in progress}
odin book is the final project in the odinbooks node.js course
and is a social media clone!

## Mvp Requirments:-
1- protect app access behind a signup/login page
2- user authentication through a method of choice (Oauth2/local-strategy)
3- user functionality:-
    - send/recieve friend requests
    - posts with full crud operations
    - like a post
4- Posts contain and display:-
    - content
    - author
    - comments
    - likes
5- feed page that displays all posts from user and thier friend network
6- profile page containing:-
    - user info
    - user photo
    - user post timeline/history
    - if authenticated with Oauth populate
        profile with available data from Oauth
7- user search page to find all users 
    - view user profile
    - enable send friend request options for users not in the network
    - display request status! for users that are in the network
## extra creddit
1- allow posts to have images
2- allow users to update thier profile photo
3- allow a guest sign in function for visitors to bypass the log in screen
    without creating an account
4- make it pretty

## preface:
seeing that a l ot of this has already been  handeled and created in my previous application chatter, i will be reusing a lot of the features designed there and optemize them for my current project, withat being said i identify a few core intities:-

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

## feed generation:-
at the minimum a feed is a chronologically ordered list of posts from both user and thier friends, wheere a "network" object is crated that contains  all of users friendships, and fetches each users data on that network including the users own posts,
the client then willsort and order the display of posts
- aditionally instead of populating all the post data all at once, a chuncking feature
should be put in place to act as a vertical carousel for posts
with a logic that despawns already seen posts, and a load chunk logic
that loads posts off screen so that user has a smooth scrolling experience without overloading the app with data,
- a feature that notifies user to go to the top of the feed and load the new posts made by friends
