import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
const GitLogin= ({})=>{
    //this is a transtionall componenet for handelling Oauth user flow only
    const{      
        auth,
        setAuthHandler,
        onLoginSuccess,
        callApi
    } = useOutletContext();
    const {gitId} = useParams();
    const[loading, setLoading]= useState(false);
    
    //fetches user data 
    const fetchUser = async()=>{
        /*
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/github/${gitId}`,
            {
            method: 'GET',
            headers:{
                'Content-Type': 'application/json'
            },
            credentials: 'include'
            }
        )
            */
        const response = await callApi({
            method: 'GET',
            path: `auth/login/github/${gitId}`,
            requiresAuth: false,
            //body: {data:1},
            token:'',
            includeCred:true
        })
        if(!response.ok)throw new Error('callApi error could not retrieve data');
            
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