import { useEffect } from 'react';
import { Login } from '../../components/login'
import style from './welcome.module.css'
import { useOutletContext, useNavigate } from "react-router-dom"
import { Icon } from '../../components/iconhelper/icons';
const WelcomePage =({})=>{
    const{auth ,initAuthHandler} = useOutletContext();
    const goTo = useNavigate();

    useEffect(()=>{
        if(auth) return goTo('/feed') 
    },[])
/*
    User,
    Search,
    Block,
    ReplyTo,
    Delete,
    EditeProfile,
    EditMessage,
    Logout,
    Plus,
*/
    return(
        <main className={style.mainContainer}>
        wellcome page!
            <Login initAuthHandler={initAuthHandler}/>          
            <Icon.User />
            <Icon.Search />
            <Icon.Block />
            <Icon.ReplyTo />
            <Icon.Delete />
            <Icon.EditeProfile />
            <Icon.EditMessage />
            <Icon.Logout />
            <Icon.Plus />
            <Icon.Like />
            <Icon.Dislike />
            <Icon.Github />
            <Icon.Comments />
        </main>
    )
}
export{
    WelcomePage
}
