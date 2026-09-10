import { useOutletContext } from 'react-router-dom';
import { SideBar } from '../../components/feedSidebar/sidebar';
import style from './feed.module.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CreatePost } from '../../components/post/createPost';
import { PostCard } from '../../components/post/postCard';
import { PostDialog } from '../../components/post/activePost/postDialog';
import { Icon } from '../../components/iconhelper/icons';
import { usePagenation } from '../../customhooks/usePagination';
const FeedPage = ({})=>{
    const {
        saveFeed, 
        auth, 
        isAuthenticated, 
        goTo, 
        callApi,
        activePost,
        selectPost,
        resetPost
    } = useOutletContext();
    //required for usePAgenation hook
    const getData = async(cursor= null, limit= 10)=>{
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            return await response.json()
        }
        catch(err){
            console.log(`Could not get data`)
            console.log(err.message)
        }
    }
    const {     
        data,
        cursor, 
        hasMore,
        loadData, 
        contextRef, 
        lastRecordRef
    } = usePagenation(getData)

    //post view dialog
    const dialogRef = useRef();
    //const [activePost, setActivePost] =  useState(null);

    //const selectPost = (post)=>{
    //    setActivePost(post)
    //}
    //const resetPost = ()=>{
    //    setActivePost(null)
    //}
    //state management
    const [user, setUser] = useState(null);
    const [loadPosts, setLoadPosts]= useState(false);

    useEffect(()=>{
        
        isAuthenticated();
        contextRef.current.scrollTop = 0;
        //SETS USER
        if(auth){
            setUser(auth.user);
            
        }else{
            goTo('/')
        }
    },[])

    return(
        <main className={style.mainContainer}>
            <div className={style.contentContainer} 
                 ref={contextRef}
                 >
                <div className={style.postCreate}>
                    <CreatePost />
                </div>
                <div className={style.postContainer} >
                    {data? (
                        data.map((post, index)=>{
                            if(Number(data.length - 1) === Number(index)){     
                                return(
                                    <>
                                        <div key={'last_post'} style={{display: "flex", justifyContent: 'center'}}>
                                            <div ref={lastRecordRef} />  
                                            <PostCard key={post.id}  
                                            post={post} 
                                            user={user} 
                                            dialog={dialogRef}
                                            selectPost={selectPost}
                                            activePost={activePost}
                                            /> 
                            
                                        </div>                                    
                                        {!hasMore  && (
                                            <div style={{display: 'flex',justifyContent: 'center'}}>
                                                No more posts! 
                                            </div>   
                                        )}
                                        {loadData && (
                                            <div>
                                                <Icon.Spinner />
                                            </div>
                                        )}
                                    </>                                          
                                )
                            }else{

                                return(
                                    <PostCard key={post.id}  
                                        post={post} 
                                        user={user} 
                                        dialog={dialogRef}
                                        selectPost={selectPost}
                                    />
                                )  
                            }                          
                        })

                    ):(
                        <h2 style={{color:"#aeaeae"}}>No Posts Found!</h2>
                    )}
                    {loadPosts &&(
                        <>
                            <Icon.Spinner />
                            LOADING POSTS ...
                        </>
                    )}
                    
                </div>                
            </div>
            {activePost && (
                <PostDialog 
                    ref={dialogRef} 
                    postId={activePost} 
                    reset={resetPost}
                    isActive={!!activePost}/>     
            )}

            
        </main>
    )
}
export{
    FeedPage
}