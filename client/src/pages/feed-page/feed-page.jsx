import { useOutletContext } from 'react-router-dom';
import { SideBar } from '../../components/feedSidebar/sidebar';
import style from './feed.module.css';
import { useEffect, useRef, useState } from 'react';
import { CreatePost } from '../../components/post/createPost';
import { PostCard } from '../../components/post/postCard';

const FeedPage = ({})=>{
    const {saveFeed, auth, isAuthenticated, goTo, callApi} = useOutletContext();

    const nextCursor = useRef(null)
    const [posts, setPosts] = useState(null);
    const [user, setUser] = useState(null)

    const getFirstFeedChunk = async()=>{
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=25`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not retrieve feed');
            const result = await response.json(); 
            nextCursor.current = result.nextCursor
            setPosts(result.feed)  
                
        }catch(err){
            console.log(err.message)
        }

    }

    useEffect(()=>{
        isAuthenticated();
        //SETS USER
        if(auth){
            setUser(auth.user);
            
        }else{
            goTo('/')
        }
        //console.log(user);
        //POPULATE FEED
        getFirstFeedChunk();
        console.log(posts)
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
                    {posts? (
                        posts.map(post=>{
                            return(<PostCard  post={fakePost} user={user}/>)
                        })
                    ):(
                        <h2 style={{color:"#aeaeae"}}>No Posts Found!</h2>
                    )}
                    
                </div>                
            </div>

            
        </main>
    )
}
export{
    FeedPage
}