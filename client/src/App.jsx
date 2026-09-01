import { useEffect, useState } from 'react'
import{Outlet, useParams, useNavigate} from 'react-router-dom'
import { Login } from './components/login.jsx'
import { TopNav } from './components/topNav/navbar.jsx'
import { WelcomePage } from './pages/welcome-page/welcome.jsx'
import style from './App.module.css'

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
    <main className={style.appContainer}>
      <div className={style.topnavContainer}>
        <TopNav  auth={auth}/>    
      </div>
      <div className={style.pageContainer}>
        <Outlet context={{
          auth,
          initAuth,
          initAuthHandler,
          setAuthHandler,
        }}/>      
      </div>

    </main>
  )
}

export default App
