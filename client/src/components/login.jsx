const Login = ()=>{
  const gitOptions ={
    client_id: import.meta.env.VITE_GH_CLIENT_ID,
    redirect_uri: 'http://localhost:3000/auth/login/github/cb',
    scope: 'user:email read:user',
  }
  const gitUrlQuery = `client_id=${gitOptions.client_id}&redirect_uri=${gitOptions.redirect_uri}&scope=${gitOptions.scope}`
    return(
    <>
      <main>
        <h1>Testing github login</h1>
        <button type='button'
        onClick={async()=>{
          window.location.href=`https://github.com/login/oauth/authorize?${gitUrlQuery}`
          }
        }
        >login with github</button>
      </main>
    </>
    )
}
export {
    Login
}