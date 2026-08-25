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