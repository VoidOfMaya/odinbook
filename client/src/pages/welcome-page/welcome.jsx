import { useEffect, useState } from 'react';
import { Login } from '../../components/login'
import style from './welcome.module.css'
import { useOutletContext, useNavigate } from "react-router-dom"
import { Icon } from '../../components/iconhelper/icons';
const WelcomePage =({})=>{
    const{auth ,initAuthHandler} = useOutletContext();
    const [ hidePasswprd, setHidePassword] = useState(true);
    const goTo = useNavigate();

    return(
        <main className={style.mainContainer}>
            <h2 style={{color:"#aaaaaadd", padding:"10px"}}>Sign in</h2>
            <div className={style.formContainer}>
                <form className={style.loginform}>
                    <label style={{gridArea: 'emailLabel'}} htmlFor='email'> 
                        <b>Email</b> 
                    </label>
                    <input style={{gridArea: 'EmailField '}} name='email' id='email'>
                    </input>                        
                  
                    <label style={{gridArea:'passwordLabel'}} htmlFor='password'>
                        <b>Password </b>
                    </label>
                    <input style={{gridArea:'passwordField'}} name='password' 
                        type={hidePasswprd? 'password': 'text'} id='password'>
                    </input>
                    <div  className={style.eye}>
                        <Icon.Eye   size={20} fn={()=>{
                            setHidePassword(!hidePasswprd)
                        }}/>  
                    </div>
                                          
                    
                    <button style={{gridArea: 'login',cursor: 'pointer'}}>Sign in</button>
                    
                    <div className={style.github}>
                        <p>or <b>Log in with Github </b></p>
                        <Login initAuthHandler={initAuthHandler}/>   
                        
                    </div>

                    <div
                    style={{gridArea: 'register', justifySelf: 'center'}}>
                        <b style={{cursor: 'pointer'}}>Create new account </b> 
                        if you havent already
                    </div>
                    
                </form>                
            </div>

        </main>
    )
}
export{
    WelcomePage
}
