import { useState, useEffect } from "react";
import style from './navbar.module.css'
import { Link, useOutletContext } from "react-router-dom";
import { Icon } from "../iconhelper/icons";

const TopNav = ({auth, redirect})=>{

    const {user, setUser} = useState(true);

    useEffect(()=>{
        //if(auth) console.log(auth)
    },[auth])
    return(
        <>
        {auth === null ?(
            <main className={style.topNav}>
                <h1>
                    Haaki
                </h1>   
                
            </main>
            ):(
                <main className={style.topNav}>
                    <div className={style.title}
                        aria-label="Haaki Logo"
                    >  
                        <h1>Haaki</h1> 
                    </div>             
                    {/* enable when in small screen mode
                    <ul className={style.navOptions}>
                        <Link to={'/feed'}>Feed</Link>
                        <Icon.Search 
                            color="#5e5e5e" 
                            focusColor="white"
                            title="search users"
                        />
                        <Link to={'/profile/me'}>
                            {auth?.user?.photo?(
                                <img src={auth.user.photo}
                                 height={40}
                                 width={40}
                                 style={{borderRadius: '25px'}} />
                            ):(
                                <Icon.User size={40} />
                            )}

                        </Link>
                    </ul>
                    */}        
                </main>

        )}
        </>
    )
}
export{
    TopNav
}