import { useEffect, useState } from 'react'
import{Outlet, useParams} from 'react-router-dom'
import { Login } from './components/login.jsx'
import './App.css'

function App() {
  const [initAuth, setInitAuth] = useState(false)
  const [auth, setAuth] = useState(null)
  const initAuthHandler =()=>{
    setInitAuth(true)
  }
  const setAuthHandler =(data)=>{
    setAuth(data)
  }
  /*
  const fetchUser = async()=>{
      const response = await fetch(`http://localhost:3000/auth/login/github`,
        {
          method: 'GET',
          headers:{
            'Content-Type': 'application/json'
          }
        }
      )
      const result = await response.json()
      setAuth({user: result.user, accessToken: result.accessToken})
  }
  useEffect(()=>{
    if(!auth){
      if(initAuth){
        const data = fetchUser();
      } 
    }
  },[initAuth])*/
  return (
    <>
    <Outlet context={{
      auth,
      initAuth,
      initAuthHandler,
      setAuthHandler,
    }}/>
      {auth? (
        <>
          <h1> welcome {auth.user.name}</h1>
          <img src={auth.user.photo} height='300px' width='300px'/>
        </>
      ):(
        <>       
        </>
      )}

    </>
  )
}

export default App
