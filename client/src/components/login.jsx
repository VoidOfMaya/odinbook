import { Icon } from "./iconhelper/icons"

const Login = ({initAuthHandler})=>{

    return(
    <>
      <main>
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
          //initAuthHandler();
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