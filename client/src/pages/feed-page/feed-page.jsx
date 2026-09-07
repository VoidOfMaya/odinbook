import { useOutletContext } from 'react-router-dom';
import { SideBar } from '../../components/feedSidebar/sidebar';
import style from './feed.module.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CreatePost } from '../../components/post/createPost';
import { PostCard } from '../../components/post/postCard';

const FeedPage = ({})=>{
    const {saveFeed, auth, isAuthenticated, goTo, callApi} = useOutletContext();
    
    //define feed management referances
    const observer = useRef();
    const contentRef = useRef(null);
    const nextCursor = useRef(null);
    const hasMore = useRef(true);
    const loadRef = useRef(false);
    const counterRef = useRef(0);

    const [posts, setPosts] = useState(null);
    const [user, setUser] = useState(null);
    const [loadPosts, setLoadPosts]= useState(false);

    const getFirstFeedChunk = async()=>{  
        //HANDELS FIRST CHUNK LOAD
        if (loadRef.current) return;    
        setLoadPosts(true);
        loadRef.current=true;
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=10`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not retrieve feed');
            const result = await response.json(); 
            nextCursor.current = result.nextCursor
            hasMore.current = result.hasMore
            setPosts(result.feed)
            setLoadPosts(false)  
                
        }catch(err){
            console.log(err.message)
        }finally{
            loadRef.current=false;
            setLoadPosts(false);
        }

    }
    const getNextFeedChunk = async(cursor)=>{
        if(loadRef.current) return console.log('exiting feedGetter function');

        loadRef.current = true;
        setLoadPosts(true);
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=10&cursor=${cursor}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not retrieve feed');
            const result = await response.json(); 
            //console.log(result)
            nextCursor.current = result.nextCursor
            hasMore.current = result.hasMore
            setPosts(prevPost =>[...prevPost,...result.feed])  
            setLoadPosts(false)
        }catch(err){
            console.log(err.message)
        }finally{
            loadRef.current=false;
            setLoadPosts(false);
        }

    }

    const lastPostRef = useCallback(post =>{
        if(!hasMore.current) return ;
        if(loadPosts)return;
        if(observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(enteries=>{
            const entry= enteries[0];        
            if(entry.isIntersecting){
                counterRef.current += 1;

                console.log(`fetching from cursor: ${nextCursor.current}`)
                getNextFeedChunk(nextCursor.current)                
            };
        },{
            root: contentRef.current,
            threshold: 0.1
        });
        if(post) observer.current.observe(post)
    },[loadPosts, nextCursor])// may not wortk 

    useEffect(()=>{
        isAuthenticated();
        //SETS USER
        if(auth){
            setUser(auth.user);
            
        }else{
            goTo('/')
        }
        //POPULATE FEED
        getFirstFeedChunk(); 
    },[])
    useEffect(()=>{
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
                <div className={style.postContainer} >
                    {posts? (
                        posts.map((post, index)=>{
                            if(Number(posts.length - 1) === Number(index)){     
                                return(
                                <>
                                    <div ref={lastPostRef} />  
                                    <PostCard key={post.id}  post={post} user={user}/>
                                                               
                                </>
                                )
                            }else{

                                return(<PostCard key={post.id}  post={post} user={user}/>)  
                            }
                            
                        })
                    ):(
                        <h2 style={{color:"#aeaeae"}}>No Posts Found!</h2>
                    )}
                    {!hasMore.current &&(
                        <h2>No more Posts!</h2>
                    )}
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