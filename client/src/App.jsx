import { useEffect, useState } from 'react'
import{Outlet, useParams, useNavigate} from 'react-router-dom'
import { Login } from './components/login.jsx'
import { TopNav } from './components/topNav/navbar.jsx'
import { WelcomePage } from './pages/welcome-page/welcome.jsx'
import './App.css'

function App() {
  const [initAuth, setInitAuth] = useState(false)
  const [auth, setAuth] = useState(null)
  const goTo = useNavigate();
  const initAuthHandler =()=>{
    setInitAuth(true)
  }
  const setAuthHandler =(data)=>{
    setAuth(data)
  }
  return (
    <>
    <TopNav  auth={auth}/>
    <Outlet context={{
      auth,
      initAuth,
      initAuthHandler,
      setAuthHandler,
    }}/>
    </>
  )
}

export default App
