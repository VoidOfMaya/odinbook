import { useState, useRef, useEffect, useCallback } from "react"
import { useOutletContext } from "react-router-dom";
import { formatDateTime } from "../../../helpers/dateTime";
import style from './postDialog.module.css'
import { Icon } from "../../iconhelper/icons";
import { CommentCard } from '../../Comments/CommentCard.jsx'
import { CreateComment } from "../../Comments/createComment.jsx";
import { usePagenation } from "../../../customhooks/usePagination.jsx";

const PostDialog = ({ref, postId, isActive, reset})=> {

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
    } = usePagenation(getData, !!postId)

    const [post, setPost]= useState();
    const [comments, setComments]= useState();
    const [isLoadingComment, setIsLoadingComment] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(false);

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
    
    useEffect(()=>{
        if(isActive) {
            ref.current.showModal()
            getPost(postId);
        }else{
            ref.current.close()
            return
        }
        
    },[postId])
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
                       <Icon.Delete color="#7f7f7f"
                            fn={()=>{
                                ref.current.close();
                                reset()
                            }}/> 
                    </div>
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
                <div className={style.Comments} ref={contextRef}>
                    <h4>Comments:</h4>
                    {isLoadingComment && !data? (
                        <div style={{display: 'flex',justifyContent: 'center', margin: '5px'}}>
                        <Icon.Spinner />
                        </div>
                    ):(
                        <div className={style.commentContainer}>
                            {data?.map((comment, index)=>{
                                if(Number(data.length - 1) === Number(index)){ 

                                    return(
                                        <div key={comment.id} >
                                            <div ref={lastRecordRef} /> 
                                            <CommentCard key={comment.id} 
                                            comment={comment} 
                                            authUser={auth.user}
                                            postIsInFocus={true}
                                            />   
                                            {!hasMore  && (
                                              <div style={{display: 'flex',justifyContent: 'center'}}>no More comments</div>   
                                            )} 
                                                                               
                                        </div>
                                    )
                                }else{
                                    return(
                                        <CommentCard key={comment.id} 
                                        comment={comment} 
                                        authUser={auth.user}
                                        postIsInFocus={true}
                                        />     
                                    )                                   
                                }
                            })} 
                            {                          
                            isLoadingComment&& (
                                <div style={{display: 'flex',justifyContent: 'center', margin: '5px'}}>
                                <Icon.Spinner />
                                </div>
                            ) }                       
                        
                        </div>
                        
                    )}
                    <CreateComment postId={postId} user={auth.user}/>
                </div>
                
            </main>
        </dialog>
    )
}
export{
    PostDialog
}