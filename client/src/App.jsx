import { useEffect, useState, useRef } from 'react'
import{Outlet, useParams, useNavigate} from 'react-router-dom'
import { Login } from './components/login.jsx'
import { TopNav } from './components/topNav/navbar.jsx'
import { WelcomePage } from './pages/welcome-page/welcome.jsx'
import style from './App.module.css'

function App() {
  const [auth, setAuth] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [feed, setFeed] = useState(null);
  const [dataLoading, setDataLoading]= useState(true);
  const goTo = useNavigate();
  //STATE MANAGER FUNCRTIONS
  const saveFeed = (data) =>{
    setFeed(data)
  }
  const onLoginSuccess = (user, token)=>{
    setAuth({user: user, accessToken: token})
    localStorage.setItem('has_session', 'true');
  }
  //PROTECT RESOURCE ON INIT
  const isAuthenticated = () =>{
    if(!auth) goTo('/')
  }
  
  // AUTHENTICATION API
  const refresh = async ()=>{
    try{
      //checks if has session flag exists in local storage befor fetching data
      if(localStorage.getItem('has_session') !== 'true') throw new Error('No session Found')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`,{
        method: "POST",
        credentials: 'include', //<= Important, this  is required to pass cookies
      })
      if(response.status === 401)throw new Error(`${response.statusText}`)
      const result = await response.json()
      
      //notify.success('Session Restored')
      setAuth({
        user:result.user,
        accessToken: result.accessToken
      })
      return {        
        user:result.user,
        accessToken: result.accessToken
      }
    }catch(err){
      console.log(err.message)
      //notify.error(`${err.message}`)
      setAuth(null)
      localStorage.clear()
    }
  }
  
  //re-authenticate//handels both 401 and 403 casses
  const reAuth = async (response)=>{
    if(response.status !== 401) return;
    try{
      //retry to refresh access token logic:-
      const result = await refresh();
      if(!result){ 
        localStorage.clear();
        throw new Error('could not refresh')
      }
      return result
    }catch(err){
        console.log('re-auth error')
        console.log(err.message)
        localStorage.clear();
        //notify.error( err.message);
        goTo('/');
    }
  }
  //RESTapi request constructor:
  const authPromis = useRef(null) //
  const callApi = async(options)=>{
    //options: {method, path, requiresAuth,body, includeCred,retry}
    //validate and set options
    if(!options) throw new Error(`No options where provided for api to call`);
    if(!options.path)throw new Error(`No path was provided for api to call`);
    if(!options.method)throw new Error(`no method provided for api to call`);
    if(options.retry === undefined) options.retry = true
    //construct fetch request body
    const createHeader = (token = auth.accessToken)=>{
      const headers = {}
      if( options.requiresAuth ){
        headers.Authorization = `Bearer ${token}`;
      }
      if(options.body && !(options.body instanceof FormData)){
        headers["Content-Type"]= 'Application/json';
      }
      return headers
    }
    const constructReqBody = (header) =>{
    if(options.body){
      return{
        method: `${options.method}`,
        headers: header,
        // formedata checker!
        body: 
          options.body instanceof FormData?
            options.body : JSON.stringify(options.body)
      }
    }else{
      return{
        method: `${options.method}`,
        headers: header
      } 
    }
    }
    const header =createHeader(options.token);
 
    const fetchData = constructReqBody(header)
    // includes credentials to body if 
    if(options.includeCred) fetchData.credentials = 'include';
    //fetch
    const response = await fetch(
    `${import.meta.env.VITE_API_URL}/${options.path}`,
      fetchData
    )
    //return if valid
    if(response.ok) return response;
     //if  status ===401 attempt fetch define retry as false
    if(response.status === 401){ 
      
      //validating singletone refresh
      if(!authPromis.current){
        authPromis.current= reAuth(response)
        .finally(()=>{
          authPromis.current= null; //once promise resolves  reset refreshState
        })
      }
      //reAuthenticating
      const newAuth = await authPromis.current;//turns to a promise on refresh
      if(!newAuth) return response;
      //disconnect socket
      //if(socket){
      //  wsio.disconnect();
      //  socket.current = wsio.connect(newAuth.accessToken)
      //} 
      //if retry = true  recall call api with retry attribute set to false
      if(!options.retry) return response;
      const retryResponse = await callApi({
        method: options.method,
        path: options.path,
        requiresAuth: options.requiresAuth,
        body: options.body,
        token: newAuth.accessToken,
        retry: false,
        includeCred:options.includeCred
      })
      //if on retry still 401 wipe data and prompt log in
      if(retryResponse.status === 401){
        setAuth(null)
        localStorage.clear();
        //wsio.disconnect()
        goTo('/')
      }
      //if retry valid(403 forbidden is valid still for auth purposes)return result!
      return retryResponse
    }
    return response
  }

  //AUTH EFFECT
  useEffect(()=>{
    const initAuth = async() =>{
      try{
        const result = await refresh();

        if(result && result.accessToken){
          goTo('/feed')
        }else{
          throw new Error('Could not restor session, please log in')
        }
      }catch(err){
        //notify.warn(err.message)
        localStorage.removeItem('has_session');
        goTo('/')
      }finally{
        setLoadingAuth(false);
      }
    }

    initAuth();
  },[])
  useEffect(()=>{
    if (!auth?.user) {
      setDataLoading(false);
      return;
    }else{
      goTo('/feed')
    }
    //fetch app data

  },[auth])
  // render while loading
  if(loadingAuth || dataLoading){
    return <div>Loading ...</div>
  }
//main render 
  return (
    <main className={style.appContainer}>
      <div className={style.topnavContainer}>
        <TopNav  auth={auth}/>    
      </div>
      <div className={style.pageContainer}>
        <Outlet context={{
          auth,
          isAuthenticated,
          saveFeed,
          onLoginSuccess,
          goTo,
          callApi,
        }}/>      
      </div>

    </main>
  )
}

export default App
