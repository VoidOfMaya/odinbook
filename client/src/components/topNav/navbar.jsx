import { useState, useEffect } from "react";
import style from './navbar.module.css'
import { Link, useOutletContext } from "react-router-dom";
import { Icon } from "../iconhelper/icons";
import { ShowPfp } from "../../helpers/pfpDisplay";

const TopNav = ({auth, redirect})=>{

    const {user, setUser} = useState(true);
    const [viewOptions, setViewOptions]= useState(false);

    useEffect(()=>{
        //if(auth) console.log(auth)
    },[auth])
    return(
        <>
        {auth === null ?(
            <main className={style.topNav}>
                <h2 style={{display: 'flex', alignItems: 'end'}}>2<Icon.Logo size={60} color="white"/></h2>    
            </main>
            ):(
                <main className={style.topNav}>
                    <div className={style.title}
                        aria-label="Haaki Logo"
                    >  
                        <h2 style={{display: 'flex', alignItems: 'end'}}>2<Icon.Logo size={60} color="white"/></h2> 
                    </div>             
                    {window.innerWidth< 780 &&
                        <div className={style.userDisplay}>
                            <ShowPfp 
                                size={40} 
                                photo={auth.user.photo} 
                                fn={()=>{
                                    setViewOptions(!viewOptions)
                                }}
                            />
                        </div> 
                    }
                    {viewOptions && (
                        <div className={style.userOptions}>
                            <div
                                onClick={()=>{
                                    redirect('/profile/me');
                                    setViewOptions(false);
                                }}
                            >
                                profile
                            </div>
                            <div

                            onClick={()=>{
                                setViewOptions(false);
                            }}
                            >
                                logout
                            </div>
                        </div>
                    )}
                </main>

        )}
        </>
    )
}
export{
    TopNav
}