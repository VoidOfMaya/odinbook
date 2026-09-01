import { useEffect, useState } from 'react';
import { Login } from '../../components/login'
import style from './welcome.module.css'
import { useOutletContext, useNavigate } from "react-router-dom"
import { Icon } from '../../components/iconhelper/icons';
const WelcomePage =({})=>{
    const{auth ,initAuthHandler} = useOutletContext();
    const [ hidePasswprd, setHidePassword] = useState(true);
    const goTo = useNavigate();

    useEffect(()=>{
        if(auth) return goTo('/feed') 
    },[])

    return(
        <main className={style.mainContainer}>
            <div className={style.formContainer}>
                <form className={style.loginform}>
                    <label style={{gridArea: 'emailLabel'}} htmlFor='email'> 
                        Email 
                    </label>
                    <input style={{gridArea: 'EmailField '}} name='email' id='email'>
                    </input>                        
                  
                    <label style={{gridArea:'passwordLabel'}} htmlFor='password'>
                        Password 
                    </label>
                    <input style={{gridArea:'passwordField'}} name='password' 
                        type={hidePasswprd? 'password': 'text'} id='password'>
                    </input>
                    <div  className={style.eye}>
                        <Icon.Eye   size={20} fn={()=>{
                            setHidePassword(!hidePasswprd)
                        }}/>  
                    </div>
                                          
                    
                    <button style={{gridArea: 'login'}}>Sign in</button>
                    
                    <div style={{gridArea: 'github', justifySelf: 'center'}}>
                        or
                        <Login initAuthHandler={initAuthHandler}/> 
                    </div>

                    <div
                    style={{gridArea: 'register'}}>
                        <b>Create new account</b> 
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
