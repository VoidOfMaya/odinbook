import { useOutletContext } from 'react-router-dom';
import { SideBar } from '../../components/feedSidebar/sidebar';
import style from './feed.module.css';
import { useEffect, useState } from 'react';
import { CreatePost } from '../../components/post/createPost';
import { PostCard } from '../../components/post/postCard';

const FeedPage = ({})=>{
    const {saveFeed,auth, isAuthenticated} = useOutletContext();
    const [user, setUser] = useState(null)
    useEffect(()=>{
        isAuthenticated()
        setUser(auth.user)
    },[])
    return(
        <main className={style.mainContainer}>
            <div className={style.sidebarContainer}>
                <SideBar user={user}/>
            </div>
            <div className={style.contentContainer}>
                <div className={style.postCreate}>
                    <CreatePost />
                    
                </div>
                <div className={style.postContainer}>
                    <PostCard />
                </div>                
            </div>

            
        </main>
    )
}
export{
    FeedPage
}