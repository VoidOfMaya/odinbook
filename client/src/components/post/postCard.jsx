import { useOutletContext } from 'react-router-dom';
import { Icon } from '../iconhelper/icons';
import { CommentCard } from '../Comments/CommentCard';
import style from './post.module.css';
import { useEffect } from 'react';
import { formatDateTime } from '../../helpers/dateTime';
import { useState } from 'react';
import { PostDialog } from './activePost/postDialog';
const PostCard = ({
    post ,
    user, 
    lastCardRef , 
    dialog, 
    selectPost, 
    activePost,
    updatePost
}) =>{
    const {auth ,callApi}= useOutletContext();
    if(!post.visibility) return
    
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
    const [inFocus, setInFocus] = useState(false);
    useEffect(()=>{
    
    },[])
    return(
        <main className={style.postCard}ref={lastCardRef && lastCardRef}>
            <div className={style.postMeta}>
                <div style={{display: 'flex',alignItems:'end'}}>
                    {post.User?.photo? (
                        <img src={post.User.photo} 
                            height={40}
                            width={40}
                            style={{borderRadius: '25px'}}
                        />
                    ):(
                        <Icon.User size={40} />
                    )}
                    <h4 style={{color:'#454545'}}>@{post.User.name}</h4>                    
                </div>

                <div className={style.AuthorOptions}>
                    {post.User.id === user?.id&&(
                        <>
                            <Icon.Delete color='#828282' focusColor='#10101'/>
                            <Icon.EditMessage  color='#828282' focusColor='#10101'/>
                        </>
                    )}
                    <h6 style={{color:'#8e8e8e'}}>{formatDateTime(post.createdAt)}</h6>
                </div>
            </div>
            <div className={style.postContent}>
                <p>{post.content}</p>
                {post.photoUrl&&(
                    <div>
                        <img src={post.photoUrl} loading='lazy' className={style.postPhoto}/>
                    </div>
                )}
            </div>
            <div className={style.postOptions}>
                <div style={{alignContent: 'center'}}>{post.likes}</div>
                <Icon.Like 
                    color='#828282' 
                    focusColor='#10101'
                    fn={()=>{
                        likePost(post.id, updatePost)
                    }}
                />
                <Icon.Dislike 
                    color='#828282' 
                    focusColor='#10101'
                    fn={()=>{
                        dislikePost(post.id, updatePost)
                    }}                    
                />
            </div>
            <div className={style.Comments}>
                <h4>Comments:</h4>
                {post.comments.map(comment=>{
                    return(
                        <CommentCard key={comment.id} comment={comment} authUser={user}/>
                    )
                })}
            </div>
            <div className={style.openPost}
                onClick={()=>{
                    selectPost(post.id)
                    dialog.current.showModal();
    
                }}>View More to interact</div>
        </main>        
    )
}
export{
    PostCard
}