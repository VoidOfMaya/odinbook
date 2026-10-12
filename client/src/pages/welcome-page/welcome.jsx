import { useEffect, useState } from 'react';
import { Login } from '../../components/login'
import style from './welcome.module.css'
import { useOutletContext, useNavigate } from "react-router-dom"
import { Icon } from '../../components/iconhelper/icons';
import { SvgBackground } from '../../helpers/svgBack';
const WelcomePage =({})=>{

    const {onLoginSuccess,initAuthHandler, callApi} = useOutletContext();
    const [ hidePasswprd, setHidePassword] = useState(true);
    const [newUser, setNewUser] = useState ({email:'',name:'',password:'',confirmPassword:''});
    const [loginData, setLoginData]= useState({email:'', password:''});
    //ENDPOINT FUNCTIONS
    const createNewUser = async(newAccount)=>{
            try{
            const response = await callApi({
                method: 'POST',
                path: `auth/register`,
                requiresAuth: false,
                body: newAccount,
                token:'',
                retry: true,
                //includeCred:true
            })
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            const result = await response.json()
            if(!result)
            if(result.message) console.log(result.message);
            setNewUser(prev=>({
                ...prev,
                email: '',
                name: '',
                password: '',
                confirmPassword: ''
            }))
        }
        catch(err){
            console.log(`Could not get data`)
            console.log(err.message)
        }
    }
    const localLogIn = async(data) =>{
        console.log(data)
        try{
            const response = await callApi({
                method: 'POST',
                path: `auth/login/local`,
                requiresAuth: false,
                body: data,
                token:'',
                retry: true,
                //includeCred:true
            })
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            return await response.json()
        }
        catch(err){
            console.log(`Could not get data`)
            console.log(err.message)
        }
    }
    const validatePasswordMatch = (password, confirmPassword) =>{
        if(password === '' || confirmPassword === '') return false
        if( password === confirmPassword) return true
        return false
    }
    //RENDER FUNCTIONS
    const signupForm = () =>{
        return(
            <div className={style.registerForm}>   
                
                <form className={style.localRegisterForm}>
                    <h6 style={{
                        gridArea: 'requirments',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#eb0c0c',
                        }}
                    >
                        all fields marked with a red line  are required
                    </h6>
                    {/*EMAIL*/}
                    <label style={{gridArea: 'emailLabel'}} htmlFor='email'> 
                        <b>Email</b> 
                    </label>
                    <input
                        style={{
                            gridArea: 'EmailField ',
                            borderRight: newUser.email === ''? '4px solid rgb(255, 0, 0)' : 'none'
                        }} 
                    required
                    name='email' 
                    id='email' 
                    value={newUser.email}
                        onChange={(e)=>{
                            setNewUser(prev=>({...prev, email: e.target.value}))
                        }}
                    >
                    </input> 
                    {/*NAME*/} 
                    <label style={{gridArea: 'nameLabel'}} htmlFor='name'> 
                        <b>Full Name</b> 
                    </label>
                    <input 
                        style={{
                            gridArea: 'nameField ',
                            borderRight: newUser.name.length < 3? '4px solid rgb(255, 0, 0)' : 'none'
                        }} 
                        name='name' 
                        id='name' 
                        value={newUser.name}
                        onChange={(e)=>{
                            setNewUser(prev=>({...prev, name: e.target.value}))
                        }}
                    >
                    </input>                       
                    {/*PASSWORD*/}
                    <label style={{gridArea:'passwordLabel'}} htmlFor='password'>
                        <b>Password </b>
                    </label>
                    <input 
                        style={{
                            gridArea:'passwordField',
                            borderRight: newUser.password.length < 8? '4px solid rgb(255, 0, 0)' : 'none'
                        }} 
                        name='password' 
                        type={hidePasswprd? 'password': 'text'} 
                        id='password' 
                        value={newUser.password}
                        placeholder='atleast 8 characters'
                        required
                        onChange={(e)=>{
                            setNewUser(prev=>({...prev, password: e.target.value}))
                        }}    
                    >
                    </input>
                    <div  className={style.eye}>
                        <Icon.Eye   size={20} fn={()=>{
                            setHidePassword(!hidePasswprd)
                        }}/>  
                    </div>
                    {/*CONFIRM PASSWORD*/}
                    <label style={{gridArea:'confpasswordLabel'}} htmlFor='password'>
                        <b>Confirm-Password </b>
                    </label>
                    <input 
                        style={{
                            gridArea:'confpasswordField',
                            borderRight: 
                                !validatePasswordMatch(newUser.password, newUser.confirmPassword)
                                ? '4px solid rgb(255, 0, 0)' 
                                : '4px solid rgb(40, 216, 13)',
                        }}
                        name='password' 
                        type={hidePasswprd? 'password': 'text'} 
                        id='password' 
                        value={newUser.confirmPassword}
                        required
                        onChange={(e)=>{
                            setNewUser(prev=>({...prev, confirmPassword: e.target.value}))
                        }}    
                    >
                    </input>
                                  
                    <button 
                        style={{gridArea: 'login',cursor: 'pointer'}}
                        type='button'
                        onClick={async()=>{
                            //validate that form is filled out
                            if(newUser.email === '') return alert('please fill out your email')
                            if(newUser.name === '') return alert('please fill out your name')
                            if(newUser.password === '') return alert('please fill out your password')
                            if(newUser.confirmPassword === '') return alert('please fill out your confirm password')
                            const result = await createNewUser(newUser);
                        }}
                    >Create Acount</button>

                    
                </form>    
            </div>
        )
    }
    const loginForm = () =>{
        return(
            <div className={style.formContainer}>
                <SvgBackground /> 
                <form className={style.loginform}>
                    <label style={{gridArea: 'emailLabel'}} htmlFor='email'> 
                        <b>Email</b> 
                    </label>
                    <input 
                        style={{
                            gridArea: 'EmailField ',
                            borderRight:loginData.email.length < 1? '4px solid rgb(255, 0, 0)' : 'none'
                        }} 
                        name='email' 
                        id='email' 
                        placeholder='example.@example.com'
                        required
                        value={loginData.email}
                        onChange={(e)=>{
                            setLoginData(prev=>({...prev, email: e.target.value}))
                        }}
                    >
                    </input>                        
                  
                    <label style={{gridArea:'passwordLabel'}} htmlFor='password'>
                        <b>Password </b>
                    </label>
                    <input 
                        style={{
                            gridArea:'passwordField',
                            borderRight: loginData.password.length < 8? '4px solid rgb(255, 0, 0)' : 'none'
                        }} 
                        name='password' 
                        type={hidePasswprd? 'password': 'text'} 
                        id='password'
                        placeholder='password@123'
                        required
                        value={loginData.password}
                        onChange={(e)=>{
                            setLoginData(prev=>({...prev, password: e.target.value}))
                        }}   
                    >
                    </input>
                    <div  className={style.eye}>
                        <Icon.Eye   size={20} fn={()=>{
                            setHidePassword(!hidePasswprd)
                        }}/>  
                    </div>
                                          
                    
                    <button type='button' style={{gridArea: 'login',cursor: 'pointer'}}
                        onClick={async()=>{
                            const result = await localLogIn(loginData);
                            onLoginSuccess(result.user, result.accessToken)
                        }}
                    >Sign in</button>

                    <div className={style.github}>
                        <p>or <b>Log in with Github </b></p>
                        <Login initAuthHandler={initAuthHandler}/>   
                        
                    </div>
                    <div className={style.guestOpt}
                        onClick={async()=>{
                            //setLoginData(prev =>({...prev, email:'GuestUser@guest.com',password:'Guest@us3r'}))
                            const result = await localLogIn({email:'GuestUser@guest.com',password:'Guest@us3r'})
                            onLoginSuccess(result.user, result.accessToken)
                        }}
                    >
                        <p>or <b>Log in as a Guest</b></p>
                        <Icon.User size={45}/> 
                    </div>
                </form>
                {window.innerWidth < 780 &&(
                    <div style={{
                        position: 'absolute',
                        bottom: '0px',
                        width: '100%',
                        height: '20%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                        }}
                    >
                        <Icon.DownArrow size={50}/>
                        scroll down to signup
                    </div> 
                )}
                  
            </div>            
        )
    }

    return(
        <main className={style.mainContainer}>
            {window.innerWidth < 780 ?(
                <>
                    {loginForm()}             
                    {signupForm()}
                </>
            ):(
                <>
                    {signupForm()}
                    {loginForm()}
                </>
            )}


        </main>
    )
}
export{
    WelcomePage
}
