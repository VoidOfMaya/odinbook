import style from './comment.module.css'
import { Icon } from '../iconhelper/icons'
import { useEffect } from 'react'
import { formatDateTime } from '../../helpers/dateTime'
import { useOutletContext } from 'react-router-dom'
const CommentCard = ({
    postId,
    comment, 
    authUser, 
    updateComments, 
    updateFeed, 
    postIsInFocus = false,
    editComment,
    setEditComment,
    setDeleteComment
})=>{
    const {auth, callApi, goTo}= useOutletContext();
    const likeComment = async(id, update)=>{
        try{
            const response = await callApi({
                method: 'PATCH',
                path: `comment/${id}/like`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok) throw new Error('Could not preform action')
            const result = await response.json();
            // update dialog window comments
            update(prev=>{
                return prev.map(comment=>
                    comment.id === id
                    ? {...comment, likes: result.likeCount}
                    : comment
                )
            })
            //update feed post comments
            updateFeed(prev=>{
                //requires both postId and commentId
                return prev.map(post=>{
                    if(post.id === postId){
                        return {
                            ...post,
                            comments:post.comments.map(comment =>
                                comment.id === id
                                ?{...comment, likes: result.likeCount}
                                : comment  
                            )
                        }
                    }else{
                        return post
                    }
                })
            })
        }catch(err){
            console.log(err.message)
        }
    }
    const dislikeComment= async(id, update)=>{
        try{
            const response = await callApi({
                method: 'PATCH',
                path: `comment/${id}/dislike`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok) throw new Error('Could not preform action')
            const result = await response.json();
            update(prev=>{
                 return prev.map(comment=>
                    comment.id === id
                    ? {...comment, likes: result.likeCount}
                    : comment
                )
            })
            updateFeed(prev=>{
                //requires both postId and commentId
                return prev.map(post=>{
                    if(post.id === postId){
                        return {
                            ...post,
                            comments:post.comments.map(comment =>
                                comment.id === id
                                ?{...comment, likes: result.likeCount}
                                : comment  
                            )
                        }
                    }else{
                        return post
                    }
                })
            })
        }catch(err){
            console.log(err.message)
        }
    }
    useEffect(()=>{
    },[])
    return(
        <main>
            <div className={style.commentMeta}>
                <div 
                    style={{
                        display: 'flex',
                        alignItems:'end',
                        cursor: 'pointer',
                    }}
                    onClick={()=>{
                        comment.User.id === auth.user.id
                            ? goTo(`/profile/me`)
                            : goTo(`/profile/${comment.User.id}`)
                    }}    
                >
                    {comment?.User?.photo? (
                        <img src={comment.User.photo} 
                            height={25}
                            width={25}
                            title='View Profile'
                            style={{borderRadius: '20px'}}
                        />
                    ):(
                        <Icon.User size={25} title='View Profile'/>
                    )}
                    <h5 style={{color:'#454545'}}>@{comment.User?.name}</h5>                    
                </div>


                <div className={style.AuthorOptions}>
                    <h6 style={{color:'#8e8e8e'}}>{formatDateTime(comment.createdAt) }</h6>
                </div>
            </div>
            <div className={style.commentContent}>
                <p>{comment.content}</p>
            </div>
           
            {postIsInFocus?(
                <div className={style.commentOptions}>
                    <div>{comment.likes}</div>
                    { comment.authorId === authUser.id&&(
                        <>
                            <Icon.Delete 
                                size={25} 
                                color='#828282' 
                                focusColor='#10101'
                                fn={()=>{
                                    const confirm = window.confirm('this action will permenantly delete your comment!')
                                    confirm && setDeleteComment(comment.id)
                                }}/>
                            <Icon.EditMessage 
                                size={25} 
                                color='#828282' 
                                focusColor='#10101'
                                fn={()=>{
                                    //if exists and id not equal to commentid
                                    //if trying to edit a different comment while already
                                    //  editing
                                    if(editComment.id !== null){
                                        if(editComment.id !== comment.id){
                                            setEditComment({id: comment.id, content: comment.content})                                            
                                        }else{
                                            setEditComment({id: null, content:''})  
                                        }
                                    }else{
                                        
                                        setEditComment({id: comment.id, content: comment.content})  
                                    }  
                                }}
                            />

                        </>
                    )}
                    <Icon.Like 
                        size={25} 
                        color='#828282' 
                        focusColor='#10101'
                        fn={()=>{
                            likeComment(comment.id, updateComments)
                        }}
                    />
                    <Icon.Dislike 
                        size={25} 
                        color='#828282' 
                        focusColor='#10101'
                        fn={()=>{
                            dislikeComment(comment.id, updateComments)
                        }}   
                    />
                </div>                
            ):(
                <div className={style.commentOptions}>{comment.likes} Likes</div>    
            )}

        </main>
    )
}
export{
    CommentCard
}