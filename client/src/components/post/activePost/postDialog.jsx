import { useState, useRef, useEffect, useCallback } from "react"
import { useOutletContext } from "react-router-dom";
import { formatDateTime } from "../../../helpers/dateTime";
import style from './postDialog.module.css'
import { Icon } from "../../iconhelper/icons";

const PostDialog = ({ref, postId})=> {

    const {callApi, auth}= useOutletContext();

    const [post, setPost]= useState();
    const [isLoadingComment, setIsLoadingComment] = useState(true)
    
    //comment pagination:-
    const observer = useRef();
    const contentRef = useRef(null);
    const nextCursor = useRef(null);
    const hasMore = useRef(true);
    const loadRef = useRef(false);
    const counterRef = useRef(0);

  const [loadPosts, setLoadPosts]= useState(false);

    const getFirstCommentChunk = async()=>{  
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
    const getNextCommentChunk = async(cursor)=>{
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

    const lastCommentRef = useCallback(post =>{
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

    const getPost =async(id)=>{
        try{
            const response = await callApi({
                method: 'GET',
                path: `post/${id}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not get post');
            const result = await response.json(); 
            console.log(result)
            setPost(result.post)
        }catch(err){
            console.log(err.message)
        }
    } 
    
    useEffect(()=>{
        if(!ref.current.open) return
        getPost(postId);
    },[postId])
    return(
        <dialog ref={ref} className={style.postCard}>
            <p>post {postId} goes here</p>
            <main>
                <div className={style.postMeta}>
                    <div style={{display: 'flex',alignItems:'end'}}>
                        {post?.User?.photo? (
                            <img src={post?.User?.photo} 
                                height={40}
                                width={40}
                                style={{borderRadius: '25px'}}
                            />
                        ):(
                            <Icon.User size={40} />
                        )}
                        <h4 style={{color:'#454545'}}>@{post?.User?.name}</h4>                    
                    </div>
               <div className={style.AuthorOptions}>
                    {post?.authorId === auth?.user?.id&&(
                        <>
                            <Icon.Delete color='#828282' focusColor='#10101'/>
                            <Icon.EditMessage  color='#828282' focusColor='#10101'/>
                        </>
                    )}
                    <h6 style={{color:'#8e8e8e'}}>{formatDateTime(post?.createdAt)}</h6>
                </div>
                </div>
                <div className={style.postContent}>
                    {post?.content}
                    {post?.photoUrl&&(
                        <div>
                            <img src={post.photoUrl} loading='lazy' className={style.postPhoto}/>
                        </div>
                    )}    
                </div>
                <div className={style.postOptions}>
                    <div>{post?.likes}</div>
                    <Icon.Like color='#828282' focusColor='#10101'/>
                    <Icon.Dislike color='#828282' focusColor='#10101'/>
                </div>
                <div className={style.Comments}>
                    <h4>Comments:</h4>
                    {isLoadingComment? (
                        <div style={{display: 'flex',justifyContent: 'center', margin: '5px'}}>
                        <Icon.Spinner />
                        </div>
                    ):(
                        <>
                            {post?.comments?.map(comment=>{
                                return(
                                    <Comment key={comment.id} comment={comment} authUser={user}/>
                    
                                )
                            })}                        
                        </>
                    )}

                </div>

            </main>
        </dialog>
    )
}
export{
    PostDialog
}