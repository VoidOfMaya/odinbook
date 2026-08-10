import { useEffect, useState } from 'react'
import{Outlet, useParams} from 'react-router-dom'
import { Login } from './components/login.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [auth, setAuth] = useState(null)
  const {gitId= null} = useParams()

  const fetchUser = async(id)=>{
      if(!id) return {message: 'no id provided'}
      const response = await fetch(`http://localhost:3000/auth/login/github/${id}`,
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
      if(gitId){
        const data = fetchUser(gitId);
      } 
    }
  },[gitId])
  return (
    <>
      {auth? (
        <>
          <h1> welcome {auth.user.name}</h1>
        </>
      ):(
        <>
          <Login />
          <div>
          </div>        
        </>
      )}

    </>
  )
}

export default App
