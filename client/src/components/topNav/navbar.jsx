import { useState } from "react";
import style from './navbar.module.css'

const TopNav = ({auth})=>{

    const {user, setUser} = useState(true);
    return(
        <>
        {auth ?(
            <>
                <h1>Haaki</h1>
            </>
            ):(
            <div className={style.title}>  
                <h1>Haaki</h1>  
            </div>
        )}
        </>
    )
}
export{
    TopNav
}