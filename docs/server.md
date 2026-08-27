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
   recieves:
   ``` json
    {
        email: "example@gmail.com",
        name: "alice cooper",
        password: "superSecretP@ssWord",
        confirmPassword:"superSecretP@ssWord",
    }
   ```
   returns status(201):
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
  returns:
  ```json
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
  path: `GET:API/login/github/state`
  
  purpose/use case: 
    intializes a new OAuth authentication attempt
  
  returns:
  ```json
  //the following data is only a representaion of what should be returned
  //httpOnlySignedCookie is set in browser cookies user can not interact with them
  //on the client side but only include them by adding credentials: include to the fetch headers
  { body: query}
  {httpOnlySignedCookie: state}
  ```
  - client should use the returned `query` in step 1

  #### Step 1:Redirect to github
  path: `https://github.com/login/oauth/authorize?${query}`

  purpose/use case:
    Redirects the user to GitHub so they can authorize the application.
    The client should construct the GitHub authorization URL using the query returned by Step 0 and redirect the browser to it.
    ```js
    window.location.href =
      `https://github.com/login/oauth/authorize?${query}`;
    ```
    After the user authorizes the application, GitHub redirects the browser back to the API.
    The server then handles the OAuth callback, retrieves the user's GitHub information, and finds or creates the corresponding user record.
    
  returns:
    The client does not receive a conventional API response from this step.
    After successful authorization, the server:
    Finds or creates the user's database record.
    Sets a short lived, httpOnly signed cookie `userId`.
    Redirects the browser 
  ```json
   `app/login/github`

  ```

  #### Step 2: Intialize a transactional Authenticaiton component
  path: `app/login/github`

  purpose/use case:
    - provides a temporary client side route used to complete the authentication 
      the serevr redirects client to github.
    - the client renders a temporary loading component at this rout
    - the component should intiate the request on step 3 when it renders
  
  returns: `this step is only a transtional bridge to automatically handle the Oauth flow with minmal end user input `

  #### Step 3: Complete github authentiation
  path:`GET:/auth/login/github`
    - `set headers: {credentials: include}`

  purpose/use case:
    - on rendering the loading component from step 2 intiate the above request
    - API will fetch the created record for the authenticated user via the temporary userId cookie
  - returns:-
  ```
  cookies: {sessionId, refreshToken}
  body:{
    user, accessToken
  }
  ```
  - its advised to set both the authenticated user object and the accessToken
    in memory
  
### Session & Token Management:-

#### Dual Token Architecture:

-Uses short lived Access Tokens(JWT)for resource authorization and long lived Refresh Tokens for session persistence.

#### Token Rotation & Thread Tracking:

-Every refresh token is bound to a threadId representing its lineage (family tree). Rotating a token issues a new token on the same thread and revokes the previous token to insure one valid token per
thread.

#### Reuse Detection & Automatic Revocation: 
    
If a previously invalidated refresh token is presented, the system flags potential token theft and immediately revokes all tokens associated with that family tree via its threadId.

#### Grace Period: 
        
-To accommodate legitimate concurrent requests (e.g., parallel initial fetches), a multi second grace period is triggered after revoking a token where it allowes for legitimate concurrent requests to bypass it for a very short period of time so to not trip the token theft detection system.

#### Frontend Implementation Note:
        
To prevent race conditions during token updates, implement a request queue or mutex on the client. Hold outgoing API requests while an expired refresh token is being rotated, ensuring all queued calls wait for and use the new token.

### Endpoints:

  #### refresh:

  re-authenticates a new jwt access token, when  provided a valid refresh token, refresh tokens can only be used once to reauthenticate a new access refresh pair`note: always provide the latest refresh token else server will auto wipe the refreshtoken tree for user, on invalid token usageas a security measure`

  route:`POST:/auth/refresh` (authentication protected)

  expects: `req.cookies:{rToken,threadId}**automatically provided**, and a valid jwt token` 

  returns:
  ```
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
  ### logout:-
  logout simply looks for the 

  route:`DELETE:/auth/logout` (authentication protected)

  expects: `toke bearer : accessToken, cookies threadId` 

  returns:
  ```
  {
    message: 'session thread removed'
  }
  ```

## User

## Network

## Post

## Comment

## Feed