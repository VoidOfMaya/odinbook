import { Icon } from "./iconhelper/icons"

const Login = ({initAuthHandler})=>{

  //const gitOptions ={
  //  client_id: import.meta.env.VITE_GH_CLIENT_ID,
  //  redirect_uri: 'http://localhost:3000/auth/login/github/cb',
  //  scope: 'user:email read:user',
  //}
  //const gitUrlQuery = `client_id=${gitOptions.client_id}&redirect_uri=${gitOptions.redirect_uri}&scope=${gitOptions.scope}`
    return(
    <>
      <main>
        {/*
        <button 
        style={{background: '#ffff'}}
        type='button'
        onClick={async()=>{
          const response = await fetch('http://localhost:3000/auth/login/github/state',{
            method: 'GET',
            header:{
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          })
          const result = await response.json()
          window.location.href=`https://github.com/login/oauth/authorize?${result.query}`
          initAuthHandler();
          }
        }
        ></button>*/}
        <Icon.Github 
        size={40} 
        title='Login with Github' 
        fn={async()=>{
          const response = await fetch('http://localhost:3000/auth/login/github/state',{
            method: 'GET',
            header:{
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          })
          const result = await response.json()
          window.location.href=`https://github.com/login/oauth/authorize?${result.query}`
          initAuthHandler();
          }
        }
        />
      </main>
    </>
    )
}
export {
    Login
}