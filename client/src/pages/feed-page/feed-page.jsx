import { useOutletContext } from 'react-router-dom';
import { SideBar } from '../../components/feedSidebar/sidebar';
import style from './feed.module.css';
import { useEffect, useRef, useState } from 'react';
import { CreatePost } from '../../components/post/createPost';
import { PostCard } from '../../components/post/postCard';

const FeedPage = ({})=>{
    const {saveFeed, auth, isAuthenticated, goTo, callApi} = useOutletContext();
    
    //define feed management referances
    const bottomRef = useRef(null);
    const contentRef = useRef(null);
    const nextCursor = useRef(null);
    //const loadRef = useRef(false);


    const [posts, setPosts] = useState(null);
    const [user, setUser] = useState(null);
    const [loadPosts, setLoadPosts]= useState(false);
    const getFirstFeedChunk = async()=>{      
        setLoadPosts(true);
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=15`,
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
            setLoadPosts(false)  
                
        }catch(err){
            console.log(err.message)
        }finally{
            //loadRef.current=false;
            setLoadPosts(false);
        }

    }
    const getNextFeedChunk = async(cursor)=>{
        //if(loadRef.current) return;

        //loadRef.current = true;
        setLoadPosts(true);
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=15&cursor=${cursor}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not retrieve feed');
            const result = await response.json(); 
            console.log(result)
            nextCursor.current = result.nextCursor
            setPosts(prevPost =>[...prevPost,...result.feed])  
            setLoadPosts(false)
        }catch(err){
            console.log(err.message)
        }finally{
            //loadRef.current=false;
            setLoadPosts(false);
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
        // HANDLE FEED PAGINATION
        const observer = new IntersectionObserver(enteries=>{
            if(enteries[0].isIntersecting){
                console.log('Reached bottom,!');
                console.log('loadinig next chunk')
                getNextFeedChunk(nextCursor.current)
            }
        },{
            root: contentRef.current
        });
        if(bottomRef.current){
            observer.observe(bottomRef.current);
        }
        return()=> observer.disconnect();   

    },[])
    useEffect(()=>{
        //console.log(posts.map(post=> post.id))
        //console.log(nextCursor.current)
    },[posts])
    return(
        <main className={style.mainContainer}>
            <div className={style.sidebarContainer}>
                <SideBar user={user}/>
            </div>
            <div className={style.contentContainer} ref={contentRef}>
                <div className={style.postCreate}>
                    <CreatePost />
                    
                </div>
                <div className={style.postContainer}>
                    {posts? (
                        posts.map(post=>{
                            return(<PostCard key={post.id}  post={post} user={user}/>)
                        })
                    ):(
                        <h2 style={{color:"#aeaeae"}}>No Posts Found!</h2>
                    )}
                    <div ref={bottomRef} />
                    {loadPosts &&(
                        <>
                            LOADING POSTS ...
                        </>
                    )}
                    
                </div>                
            </div>

            
        </main>
    )
}
export{
    FeedPage
}