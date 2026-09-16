import style from './comment.module.css';
import { Icon } from '../iconhelper/icons';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
const CreateComment = ({
    postId, 
    user, 
    commentCount,
    updateActive, 
    updateFeed,
    setEditCommentId,
    editCommentId,

}) =>{
    //creates a comment and updates comments !
    const {auth, callApi} = useOutletContext();
    const [isSending, setIsSending]= useState(false)
    const [content, setContent]= useState('')

    const shiftFeedComment =(postId, newComment)=>{
        updateFeed(prev =>
            prev.map(post =>
                post.id === postId
                ? {...post, comments:[newComment, ...post.comments].slice(0, 3)}
                : post
            )    
        )
    }
    const createComment = async (postId)=>{
        try{
            const response = await callApi({
                method: 'POST',
                path: `post/${postId}/comment/new`,
                requiresAuth: true,
                body: {content: content},
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok) throw new Error('Could not preform action')
            const result = await response.json();
            //updates  pagination data for comments
            updateActive(prev =>[result.comment, ...prev])
            //insures feed data only has 3 comments
            shiftFeedComment(postId, result.comment)

        }catch(err){
            console.log(err.message)
        }
    }
    const editExistingComment = async ()=>{

    }
    useEffect(()=>{
        console.log(editCommentId)
    },[editCommentId])
    useEffect(()=>{
    },[])
    useEffect(()=>{
        
    },[content])
    return(
        <main className={style.CreateCommentContainer}>
            <title>Post creation pannel</title>
            <form className={style.commentForm}> 
                <h6 style={{
                        position: 'absolute', 
                        bottom: '0',
                        color: content.length > 750
                        ? 'rgb(255, 35, 35)'
                        : 'rgb(128, 129, 128)'
                    }}
                >
                    {content.length}/750
                </h6>  
                {editCommentId?(
                    <div style={{color: 'red', position:'absolute'}}>editing {editCommentId}</div>
                ):('')}           
                <textarea 
                    placeholder='Whats on your mind today!' 
                    value={content}
                    onChange={(e)=>{
                        setContent(e.target.value)
                    }}
                />
                <div className={style.commentTabBtn}>
                    {isSending? (
                        <Icon.Spinner size={10}/>
                    ):(
                        <Icon.Send 
                            size={30} 
                            color="#646363"  
                            focusColor="#fff" 
                            title='Create Post'
                            fn={()=>{
                                createComment(postId)
                            }}
                        />                        
                    )}

                </div>
            </form>
            
        </main>
    )
}
export{
    CreateComment
}