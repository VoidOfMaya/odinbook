import { useOutletContext } from 'react-router-dom';
import { Icon } from '../iconhelper/icons';
import { Comment } from '../Comments/CommentCard';
import style from './post.module.css';
const PostCard = ({post ,user}) =>{
    //if(!post){
    //    return(
    //        <>Could not populate post</>
    //    )
    //}
    if(!post.visibility) return
    return(
        <main key={post.id} className={style.postCard}>
            <div className={style.postMeta}>
                <div style={{display: 'flex',alignItems:'end'}}>
                    {post.author.photo? (
                        <img src={post.author.photo} 
                            height={40}
                            width={40}
                            style={{borderRadius: '25px'}}
                        />
                    ):(
                        <Icon.User size={40} />
                    )}
                    <h4 style={{color:'#454545'}}>@{post.author.name}</h4>                    
                </div>


                <div className={style.AuthorOptions}>
                    {post.author.id === user?.id&&(
                        <>
                            <Icon.Delete color='#828282' focusColor='#10101'/>
                            <Icon.EditMessage  color='#828282' focusColor='#10101'/>
                        </>
                    )}
                    <h6 style={{color:'#8e8e8e'}}>{post.createdAt}</h6>
                </div>
            </div>
            {post.photoUrl&&(
                <div>
                    <img src={post.photoUrl}/>
                </div>
            )}
            <div className={style.postContent}>
                <p>{post.content}</p>
            </div>
            <div className={style.postOptions}>
                <Icon.Like color='#828282' focusColor='#10101'/>
                <Icon.Dislike color='#828282' focusColor='#10101'/>
                <Icon.Comments color='#828282' focusColor='#10101'/>
            </div>
            <div className={style.Comments}>
                {post.comments.map(comment=>{
                    return(
                        <Comment comment={comment} auth={auth} />
                    )
                })}
            </div>
        </main>        
    )
}
export{
    PostCard
}