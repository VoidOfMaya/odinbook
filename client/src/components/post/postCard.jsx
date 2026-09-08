import { useOutletContext } from 'react-router-dom';
import { Icon } from '../iconhelper/icons';
import { Comment } from '../Comments/CommentCard';
import style from './post.module.css';
import { useEffect } from 'react';
import { formatDateTime } from '../../helpers/dateTime';
const PostCard = ({post ,user, lastCardRef}) =>{
    //if(!post){
    //    return(
    //        <>Could not populate post</>
    //    )
    //}
    if(!post.visibility) return
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
                <div>{post.likes}</div>
                <Icon.Like color='#828282' focusColor='#10101'/>
                <Icon.Dislike color='#828282' focusColor='#10101'/>
            </div>
            <div className={style.Comments}>
                <h4>Comments:</h4>
                {post.comments.map(comment=>{
                    return(
                        <Comment key={comment.id} comment={comment} authUser={user}/>
                    )
                })}
            </div>
            <div className={style.openPost}>View More to interact</div>
        </main>        
    )
}
export{
    PostCard
}