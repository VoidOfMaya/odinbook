import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom"
const GitLogin= ({})=>{
    //this is a transtionall componenet for handelling Oauth user flow only
    const{      
        auth,
        setAuthHandler,
        onLoginSuccess
    } = useOutletContext();
    const[loading, setLoading]= useState(false);
    
    //fetches user data 
    const fetchUser = async()=>{
    const response = await fetch(`http://localhost:3000/auth/login/github`,
        {
          method: 'GET',
          headers:{
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      )
    const result = await response.json()
    onLoginSuccess(result.user, result.accessToken)

    }
    //redirect user to home once authenticated
    const redirect = useNavigate();
    useEffect(()=>{
        if(!auth){
            setLoading(true)
            fetchUser();
        }else{
            setLoading(false)
            redirect('/feed')       
        }

    },[auth])
return(
    <>
       {loading? (
        <>
            <h1 
            style={
                {
                    display: 'flex',
                    justifySelf: 'center',
                    alignSelf:'center'
                }
            }>Processing...</h1>
        </>
       ):(
        <h1>Could not load user</h1>
       )}
    </>
    )
}
export{
    GitLogin
}