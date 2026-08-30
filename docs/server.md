# Server Docs

### preface:-
this document serves as a map for developers to guide and help understand how to access and interface with the APIs endpoints correctly, this document will be orgenized by each resources endpoint!

## Authentication
The API provides flexible user authentication, session management across multiple devices, and automated reuse detection to protect against token theft.
    
### Methods:-

- Local Strategy: Traditional username and password.
- OAuth 2.0: Third-party sign in via GitHub.
### Local strategy:-
  #### Register:`POST:/auth/register`
  - password is hashed with `bcrypt.js` and then saved to the database
   ##### recieves:
   ``` json
    {
        email: "example@gmail.com",
        name: "alice cooper",
        password: "superSecretP@ssWord",
        confirmPassword:"superSecretP@ssWord",
    }
   ```
   ##### returns:
   ```json
    {
        message: "User  registered successfully"
    }
   ```

  #### Log in:`POST:/auth/login/local`
  
  recieves in req.body:
  ```json
  {
    email: "example@gmail.com", 
    password:"examplePassword123@"
  }
  ```
  ##### returns:
  ```js
  //req.status(200)

  //signed Cookies:-
  {
    threadId,
    refreshToken
  }
  // req.Body
  {
    user:{
        id,
        email,
        name,
        bio,
        photo,
        createdAt,
        lastOnline,
    },
    accessToken,
  }
  ```
### Oauth2.0 with Github:-
  - The GitHub OAuth flow is primarily handled server side. The API uses short lived, httpOnly signed cookies to securely transfer temporary authentication state between the OAuth steps, preventing sensitive OAuth/session data from being exposed to client side JavaScript.
  <img src='./images/secure git Oauth flow.jpg'/>

  #### Step 0: Intialize github Oauth
  ##### path: `GET:API/login/github/state`
  
  ##### purpose/use case: 
  - intializes a new OAuth authentication attempt
  
  ##### returns:
  ```js
  //the following data is only a representaion of what should be returned
  //httpOnlySignedCookie is set in browser cookies user can not interact with them
  //on the client side but only include them by adding credentials: include to the fetch headers
  { body: query}
  {httpOnlySignedCookie: state}
  ```
  - client should use the returned `query` in step 1

  #### Step 1:Redirect to github
  ##### path: `https://github.com/login/oauth/authorize?${query}`

  ##### purpose/use case:

  - Redirects the user to GitHub so they can authorize the application.
      The client should construct the GitHub authorization URL using the query returned by Step 0 and redirect the browser to it.
    ```js
    window.location.href =
      `https://github.com/login/oauth/authorize?${query}`;
    ```
    After the user authorizes the application, GitHub redirects the browser back to the API.
    The server then handles the OAuth callback, retrieves the user's GitHub information, and finds or creates the corresponding user record.
    
  ##### returns:
  The client does not receive a conventional API response from this step.
    After successful authorization, the server:
    Finds or creates the user's database record.
    Sets a short lived, httpOnly signed cookie `userId`.
    Redirects the browser 
  ```json
   `app/login/github`

  ```

  #### Step 2: Intialize a transactional Authenticaiton component
  ##### path: `app/login/github`

  ##### purpose/use case:
  - provides a temporary client side route used to complete the authentication 
      the serevr redirects client to github.
  - the client renders a temporary loading component at this rout
  - the component should intiate the request on step 3 when it renders
  
  ##### returns: `this step is only a transtional bridge to automatically handle the Oauth flow with minmal end user input `

  #### Step 3: Complete github authentiation
  ##### path:`GET:/auth/login/github`
  - `set headers: {credentials: include}`

  ##### purpose/use case:
  - on rendering the loading component from step 2 intiate the above request
  - API will fetch the created record for the authenticated user via the temporary userId cookie
  ##### returns:-
  ```js
  cookies: {sessionId, refreshToken}
    user:{
      id,
      email,
      name,
      bio,
      photo,
      lastOnline,
      isOnline,
      createdAt
  },
  accessToken
  ```
  - its advised to set both the authenticated user object and the accessToken
    in memory
### Session & Token Management:-

#### Dual Token Architecture:

- Uses short lived Access Tokens(JWT)for resource authorization and long lived Refresh Tokens for session persistence.

#### Token Rotation & Thread Tracking:

- Every refresh token is bound to a threadId representing its lineage (family tree). Rotating a token issues a new token on the same thread and revokes the previous token to insure one valid token per
thread.

#### Reuse Detection & Automatic Revocation: 
    
- If a previously invalidated refresh token is presented, the system flags potential token theft and immediately revokes all tokens associated with that family tree via its threadId.

#### Grace Period: 
        
- To accommodate legitimate concurrent requests (e.g., parallel initial fetches), a multi second grace period is triggered after revoking a token where it allowes for legitimate concurrent requests to bypass it for a very short period of time so to not trip the token theft detection system.

#### Frontend Implementation Note:
        
- To prevent race conditions during token updates, implement a request queue or mutex on the client. Hold outgoing API requests while an expired refresh token is being rotated, ensuring all queued calls wait for and use the new token.
#### Endpoints:

  #### refresh:

  - re authenticates a new jwt access token, when  provided a valid refresh token, refresh tokens can only be used once to reauthenticate a new access refresh pair`note: always provide the latest refresh token else server will auto wipe the refreshtoken tree for user, on invalid token usage as a security measure`

  ##### path:`POST:/auth/refresh` (authentication protected)

  ##### expects: `req.cookies:{rToken,threadId} include credentials on fetch` 

  ##### returns:
  ```js
   cookies: {sessionId, refreshToken}
  {
    user:{
        id,
        email,
        name,
        bio,
        photo,
        lastOnline,
        isOnline,
        createdAt
    },
    accessToken
  }
  ```
  #### logout:-
  logout simply looks for the 

  ##### path:`DELETE:/auth/logout` (authentication protected)

  ##### expects: `toke bearer : accessToken, cookies threadId` 

  ##### returns:
  ```js
  {
    message: 'session thread removed'
  }
  ```
## User
### Endpoints:-
- all endpoints are authentication protected meaning each request
  **must provide a valid jwt**  else refresh access token
#### Get user(me) profile:-
  ##### path:`GET:/user//me`

  ##### expects:
  - user is authenticated 
    - authenticated users id is  validated against the db as the single source of truth 

  ##### returns:
  ```js
  {
    id, 
    name, 
    bio, 
    photo, 
    isOnline,
    lastOnline, 
    createdAt
  }
  ```
#### Edit user(me) profile:-
  ##### path:`PATCH:/user/me`
    - validates update content
  ##### expects:
  - in body:{ name, bio, photo}
    - each field is optional!, provide an empty string `""` for that field
      when requesting an update

  ##### returns:
  ```js
  {
    message: 'Profile updated successfully'
  }
  ```
#### Search for users by name:-
  ##### path:`GET:/user/search`
  - validates name query where it can only be a string
  ##### expects:
  - set a query variable as "name" with the desired username


  ##### returns:
  ```js
  {
    //returns a list of users that match the query and empty array if no match is found
    [
      {            
        id: true,
        name: true,
        photo: true
      },
      .
      .
      .
    ]
  }
  ```
#### Get user(other) profile:-
  ##### path:`GET:/user/:id`
  - validates user id as a valid int
  - Privacy setting protected(if user is set to isPrivate: true) user
    can not view profile unless in an active connection with user thats 
    preforming the resource request
  ##### expects:
  - id as a parameter in the request header example: `Get:/${userId}`
  ##### returns:
  ```js
  {
    id, 
    name, 
    bio, 
    photo, 
    isOnline,
    lastOnline, 
    createdAt
  }
  ```
## Network
### Endpoints:-
- all endpoints are authentication protected meaning each request
  **must provide a valid jwt**  else refresh access token
#### Get connections
  ##### path:`GET:/network/connection`
  ##### expects:
  - a status query: status: `"ACTIVE"/"PENDING"/"BLOCKED"/"DECLINED"`
  ##### returns:
  ```js
      {
      friends: [
        { 
          meta:
            {connectionId, status},
          user: 
            {id, name, photo, bio, onlineStatus} 
        },
        .
        .
        .
      ]
    }
  ```
#### Create new Connection(send friend request):-
  ##### path:`POST:/network/connection`
  ##### expects:
  - a `recipiantId` defined in the request body
  ##### returns:
  ```js
  //will throw a 409 status if a valid (does not include records with a declined status)record already exists
  {
    connectionId,
  }
  ```
#### Update Connection(activate/reject/block):-
  ##### path:`GET:/network/connection/:id`
  ##### expects:
  - set `updateStatus` with one of the following:
    - `"ACTIVE"`
    - `"PENDING"`
    - `"BLOCKED"`
    - `"DECLINED"`

  - in the request body
  ##### returns:
  ```js
  {message: 'Connection statuse updated!'}
  ```
## Post
### Endpoints:-
- all endpoints are authentication protected meaning each request
  **must provide a valid jwt**  else refresh access token

#### Create Post
  ##### path:`POST:/post/`
  ##### expects:
  - `{content, photo(optional)}` in request body
  ##### returns:
  ```js
  {message: "post created!", post}
  ```

#### Get Single post
  ##### path:`GET:/post/:id`
  ##### expects:
  - post `id` in `req.params`
  ##### returns:
  ```js
  {post}
  ```

#### Like a Post
  ##### path:`PATCH:/post/:id/like`
  ##### expects:
  - post `id` in `req.params`
  ##### returns:
  ```js
  {message: "Post Liked", likeCount}
  ```

#### Dislike a Post
  ##### path:`PATCH:/post//:id/dislike`
  ##### expects:
  - post `id` in `req.params`
  ##### returns:
  ```js
  {message: "Post Disliked", likeCount}
  ```

#### Edit Post
  - this rout is protected and **can only be accessed by the post author**
  ##### path:`PATCH:/post/:id`
  ##### expects:
  - user provides `content, photo(optional)` in `req.body`
  - post `id` in `req.params`
  ##### returns:
  ```js
  {message:"Post Updated!", post: post}
  ```

#### Delete Post
  - this rout is protected and **can only be accessed by the post author**

  ##### path:`DELETE:/post/:id`
  ##### expects:
  - post `id` in `req.params`
  ##### returns:
  ```js
  {message: 'Post Deleted', post: post}
  ```
//Nested routes!
postRouter.use('/:id/comment',validate.postId, commentRouter);
### Nested Endpoints:-

#### Comment on  post:-
  ##### path:`POST:/post/:id/comment/new`
  ##### expects:
  - post `id` in `req.params`
  - a `comment: "insert comment here"` variable in `req.body`
    - length wise `min: 1, max: 750`
  
  ##### returns:
  ```js
  {message: "comment created", comment: newComment}
  ```

#### Get post comments:-
  ##### path:`GET:/post/:id/comment/list`
  ##### expects:
  - post `id` in `req.params`
  - a `limit` query(determains how many comments to get per query)
  - a `cursor`query (if not defined: denotes the first fetch , if defined: denotes which
  comment to start fetching from for an organized feed)
  ##### returns:
  ```js
  {comments, nextCursor}
  ```


## Comment
  ##### path:`GET:/post/connections`
  ##### expects:
  ##### returns:
  ```js
  ```
### Endpoints:-
- all endpoints are authentication protected meaning each request
  **must provide a valid jwt**  else refresh access token

commentRouter.get('/commentlist',validate.limit,validate.cursor,controller.getComments)//get comments 
#### Get post comment:-
  ##### path:`GET:/post/:id/comment/commentList`
  ##### expects:
  - expects a limit be provided ,if no limit is provided it will use the default value of 1
  - to enable pagination  inject the `nextCursor` provided by the first request into the query along side the limit
  ##### returns:
  ```js
  {
    comments:[
      {}
    ], 
    nextCursor: nextCursor.id
  }
  ```
//authenticated users only


post('/newComment',validate.newComment,controller.createComment)//post a 
new comment on parent post
#### create new comment:-
  ##### path:`POST:/post/:id/comment/newComment`
  ##### expects:

  ##### returns:
  ```js

  ```
patch('/:id/like',validate.id, controller.likeComment)
#### like a comment:-
  ##### path:`PATCH:/comment/:id/like`
  ##### expects:

  ##### returns:
  ```js

  ```
patch('/:id/dislike',validate.id, controller.dislikeComment)
#### dislike a comment:-
  ##### path:`PATCH:/comment/:id/dislike`
  ##### expects:

  ##### returns:
  ```js

  ```
//comment authors only
commentRouter.patch('/:id',validate.id,validate.comment,isUserAuthor,controller.editComment)//validate ownership of comment
commentRouter.delete('/:id',validate.id,isUserAuthor, controller.deleteComment)//delete comment where user is comment author

## Feed
### Endpoint:-
- all endpoints are authentication protected meaning each request
  **must provide a valid jwt**  else refresh access token
  ##### path:`GET:/feed`
  ##### expects:
  ##### returns:
  ```js
  ```