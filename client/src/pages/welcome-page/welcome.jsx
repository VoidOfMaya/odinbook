import { useEffect, useState } from 'react';
import { Login } from '../../components/login'
import style from './welcome.module.css'
import { useOutletContext, useNavigate } from "react-router-dom"
import { Icon } from '../../components/iconhelper/icons';
import { SvgBackground } from '../../helpers/svgBack';
const WelcomePage =({})=>{
    const{auth ,initAuthHandler} = useOutletContext();
    const [ hidePasswprd, setHidePassword] = useState(true);
    const goTo = useNavigate();

    return(
        <main className={style.mainContainer}>
            <div className={style.registerForm}>
                
                <form className={style.localRegisterForm}>
                    {/*EMAIL*/}
                    <label style={{gridArea: 'emailLabel'}} htmlFor='email'> 
                        <b>Email</b> 
                    </label>
                    <input style={{gridArea: 'EmailField '}} name='email' id='email'>
                    </input> 
                    {/*NAME*/} 
                    <label style={{gridArea: 'nameLabel'}} htmlFor='name'> 
                        <b>Full Name</b> 
                    </label>
                    <input style={{gridArea: 'nameField '}} name='name' id='name'>
                    </input>                       
                    {/*PASSWORD*/}
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
                    {/*CONFIRM PASSWORD*/}
                    <label style={{gridArea:'confpasswordLabel'}} htmlFor='password'>
                        <b>Confirm-Password </b>
                    </label>
                    <input style={{gridArea:'confpasswordField'}} name='password' 
                        type={hidePasswprd? 'password': 'text'} id='password'>
                    </input>
                                  
                    <button style={{gridArea: 'login',cursor: 'pointer'}}>Create Acount</button>

                    
                </form>    
            </div>
            <div className={style.formContainer}>
                <SvgBackground /> 
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
                    <div className={style.guestOpt}>
                        <p>or <b>Log in as a Guest</b></p>
                        <Icon.User size={45}/> 
                    </div>
                </form>                
            </div>
        </main>
    )
}
export{
    WelcomePage
}
