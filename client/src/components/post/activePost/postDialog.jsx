import { useState, useRef, useEffect, useCallback } from "react"
import { useOutletContext } from "react-router-dom";
import { formatDateTime } from "../../../helpers/dateTime";
import style from './postDialog.module.css'
import { Icon } from "../../iconhelper/icons";
import { CommentCard } from '../../Comments/CommentCard.jsx'
import { CreateComment } from "../../Comments/createComment.jsx";
import { usePagenation } from "../../../customhooks/usePagination.jsx";

const PostDialog = ({ref, postId, isActive, reset,deactivate, update})=> {

    const {callApi, auth}= useOutletContext();
    const getData = async(cursor= null, limit= 10)=>{
        try{
            const response = await callApi({
                method: 'GET',
                path: `post/${postId}/comment/list?limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(response.status === 404) return
            if(!response.ok)throw new Error(`Error: ${response.status},no comments where found`);

            return await response.json()
        }
        catch(err){
            console.log(`Could not get data`)
            console.log(err.message)
        }
    }
    const {     
        data,
        updateData,
        cursor, 
        hasMore,
        loadData, 
        contextRef, 
        lastRecordRef
    } = usePagenation(getData, !!postId)

    const [post, setPost]= useState();
    const [comments, setComments]= useState();
    const [isLoadingComment, setIsLoadingComment] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(false);

    const [editMode, setEditMode]= useState(false);
    const [content, setContent]= useState('')

    //edit comment state
    const [editComment, setEditComment] = useState({id: null, content: ''});
    
    //delete comment states
    const [deleteComment, setDeleteComment]= useState(null);
 
    //POST SERVER CRUD
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
            setPost(result.post)
        }catch(err){
            console.log(err.message)
        }
    } 
    const editPost =async(id, update)=>{
            try{
            const response = await callApi({
                method: 'PATCH',
                path: `post/${id}`,
                requiresAuth: true,
                body: {content},
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not update post');
            const result = await response.json(); 
            setPost(prev=>({...prev,content: result.post.content}));
            update(prev=>{
                 return prev.map(post=>
                    post.id === id
                    ? {...post, content: result.post.content}
                    : post
                )
            })

        }catch(err){
            console.log(err.message)
        }  
    }
    const likePost = async(id, update)=>{
        try{
            const response = await callApi({
                method: 'PATCH',
                path: `post/${id}/like`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok) throw new Error('Could not preform action')
            const result = await response.json();
            setPost(prev=>({...prev,likes: result.likeCount}));
            update(prev=>{
                 return prev.map(post=>
                    post.id === id
                    ? {...post, likes: result.likeCount}
                    : post
                )
            })
        }catch(err){
            console.log(err.message)
        }
    }
    const dislikePost = async(id, update)=>{
        try{
            const response = await callApi({
                method: 'PATCH',
                path: `post/${id}/dislike`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok) throw new Error('Could not preform action')
            const result = await response.json();
            setPost(prev=>({...prev,likes: result.likeCount}));
            update(prev=>{
                 return prev.map(post=>
                    post.id === id
                    ? {...post, likes: result.likeCount}
                    : post
                )
            })
        }catch(err){
            console.log(err.message)
        }
    }
    const deletePost = async (id, update)=>{
        try{
            if(!id) throw new Error ('Post id is not defined')
            const response = await callApi({
                method: 'DELETE',
                path: `post/${id}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok){
                const result = await response.json()
                const errors = {...result.error.message}
                throw new Error(`Error(${response.status}), error message: ${errors}`)
            }
            const result = await response.json();
            update(prev=>{
                return prev.filter(post => post.id !== id)
            })
        }catch(err){
            console.log(err.message)
        }
    }
    //COMMENT SERVER CRUD
   const deleteCommentById = async(id)=>{
        try{
            const response = await callApi({
                method: 'DELETE',
                path: `comment/${id}`,
                requiresAuth: true,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok) throw new Error('Could not preform action')
            const result = await response.json();
            //create new list of comments without comment at id
            const updatedComments = data.filter(comment=> comment.id !== id)
            //update local content state with updatedcomments array
            //effectively replacing data with itself - comment
            updateData(updatedComments)
            //update feed state
            update(prev=>{
                //pass updated comments list and slice the top 3 for feed
                return prev.map(post=>{
                    return post.id === postId
                    ?   {...post,comments: updatedComments.slice(0,3)}
                    :   post
                })
            })
        }catch(err){
            console.log(err.message)
        }
    }


    //RENDER FUNCTIONS
    const populateComments = () =>{
        return(
            <>
            <h4>Comments:</h4>
            {/*DATA STILL LOADING CASE*/}
            {isLoadingComment && !data? (
                <div style={{display: 'flex',justifyContent: 'center', margin: '5px'}}>
                <Icon.Spinner />
                </div>
            ):(
                <>{/*DATA HAS LOADED CASE*/}
                    {!data? (
                        <>{/*NO COMMENTS FOUND CASE*/}
                            <h5
                                style={{
                                    color: "rgb(171, 171, 171)",
                                    padding: '10px'
                                }}
                            > no comments found</h5>
                        </>    
                    ):(
                        <div className={style.commentContainer}>
                            {/*POPULATE COMMENTS*/}
                            {data?.map((comment, index)=>{
                                if(Number(data.length - 1) === Number(index)){
                                    {/*COMMENT CARD IS THE LAST COMMENT*/} 
                                    return(
                                        <div key={comment.id} >
                                            <div ref={lastRecordRef} /> 
                                            <CommentCard key={comment.id} 
                                            postId={postId}
                                            comment={comment} 
                                            authUser={auth.user}
                                            postIsInFocus={true}
                                            updateComments={updateData}
                                            updateFeed= {update}
                                            setEditComment={setEditComment}
                                            editComment={editComment}
                                            setDeleteComment ={setDeleteComment}
                                            />   
                                            {!hasMore  && (
                                            <div style={{display: 'flex',justifyContent: 'center'}}>no More comments</div>   
                                            )}                                                         
                                        </div>
                                    )
                                }else{
                                    {/*COMMENT CARD*/}
                                    return(
                                        <CommentCard key={comment.id} 
                                        postId={postId}
                                        comment={comment} 
                                        authUser={auth.user}
                                        postIsInFocus={true}
                                        updateComments={updateData}
                                        updateFeed= {update}
                                        setEditComment={setEditComment}
                                        editComment={editComment}
                                        setDeleteComment ={setDeleteComment}
                                        />     
                                    )                                   
                                }
                            })} 
                            {    
                            /*COMMENT LOADING INDICATOR*/                     
                            isLoadingComment&& (
                                
                                <div style={{display: 'flex',justifyContent: 'center', margin: '5px'}}>
                                <Icon.Spinner />
                                </div>
                            ) }                                       
                        </div>
                    )}
                </>     
                )}
            </>
        )
    }
    useEffect(()=>{
        
        if(!deleteComment) return
        console.log(deleteComment)
        deleteCommentById(deleteComment)
        setDeleteComment(null)
    },[deleteComment])
    useEffect(()=>{
        if(isActive) {
            ref.current.showModal()
            getPost(postId);
        }else{
            ref.current.close()
            return
        }
        
    },[postId])
    useEffect(()=>{
        if(!post)return
        setContent(post.content)
    },[post])
    return(
        <dialog ref={ref}  className={style.dialogWindow}>
            
            <main className={style.postCard}>
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
                    <div style={{margin: '10px'}}>
                        <h5 style={{color: 'rgb(147, 151, 147)', cursor: 'pointer'}}
                            onClick={()=>{
                            ref.current.close();
                            reset()    
                            }}
                        >
                            close X
                        </h5>
                    </div>
                <div className={style.Options}>
                    {post?.authorId === auth?.user?.id&&(
                        <div style={{display: 'flex'}}>
                            {editMode? 
                                (
                                    <div style={{display: "flex",gap: '20px'}}>
                                        <button
                                            type="button"
                                            onClick={()=>{
                                                setEditMode(false)
                                            }}
                                        >Exit editMode </button> 
                                        <button 
                                            type="button"
                                            onClick={()=>{
                                                editPost(post.id);
                                                setEditMode(false);
                                            }}
                                        > save</button>
                                        <Icon.Delete 
                                            color='#828282' 
                                            focusColor='#10101' 
                                            title="Remove post"
                                            fn={()=>{
                                                const confirm = window.confirm('are you sure you want to delete this post?')
                                                if(!confirm) return;
                                                deletePost(post.id, update)
                                               ref.current.close();
                                                reset() 
                                            }}
                                        />                           
                                    </div>

                                ):(
                                    <>
                                        <Icon.EditMessage  
                                            color='#828282' 
                                            focusColor='#10101' 
                                            title="Edit post"
                                            fn={()=>{
                                                setEditMode(true)
                                            }}
                                        />
                                    </>                                    
                                )
                            }

                        </div>
                    )}
                    <h6 style={{color:'#8e8e8e',textAlign: 'end'}}>
                        {formatDateTime(post?.createdAt)}
                    </h6>    
                </div>
                </div>
                </div>
                {editMode?(
                    <div className={style.postContent}>
                        <textarea  
                            value={content}
                            onChange={(e)=>{
                                setContent(e.target.value)
                            }}
                        />  
                        {post?.photoUrl&&(
                            <div>
                                <img src={post.photoUrl} loading='lazy' className={style.postPhoto}/>
                            </div>
                        )}                          
                    </div>
                ):(
                    <div className={style.postContent}>
                        {post?.content}
                        {post?.photoUrl&&(
                            <div>
                                <img src={post.photoUrl} loading='lazy' className={style.postPhoto}/>
                            </div>
                        )}    
                    </div>                    
                )}

                <div className={style.postOptions}>
                    <div>{post?.likes}</div>
                    <Icon.Like 
                        color='#828282' 
                        focusColor='#10101'
                        fn={()=>{
                            likePost(post.id, update)
                        }}/>
                    <Icon.Dislike 
                        color='#828282' 
                        focusColor='#10101'
                        fn={()=>{
                            dislikePost(post.id, update)
                        }}
                    />
                </div>
                <div className={style.Comments} ref={contextRef}>

                    {populateComments()}
                    
                    <CreateComment 
                        postId={postId} 
                        user={auth.user}
                        updateActive={updateData}
                        updateFeed={update}
                        setEditComment={setEditComment}
                        editComment={editComment}

                    />
                </div>
                
            </main>
        </dialog>
    )
}
export{
    PostDialog
}