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
          {console.log(auth.user)}
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
