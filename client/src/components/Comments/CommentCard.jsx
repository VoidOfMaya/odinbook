import style from './comment.module.css'
import { Icon } from '../iconhelper/icons'
import { useEffect } from 'react'
import { formatDateTime } from '../../helpers/dateTime'
const Comment = ({comment, authUser, postIsInFocus = false})=>{
    useEffect(()=>{
    },[])
    return(
        <main>
            <div className={style.commentMeta}>
                <div style={{display: 'flex',alignItems:'end'}}>
                    {comment.User?.photo? (
                        <img src={comment.User.photo} 
                            height={25}
                            width={25}
                            style={{borderRadius: '20px'}}
                        />
                    ):(
                        <Icon.User size={25} />
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
                            <Icon.Delete size={25} color='#828282' focusColor='#10101'/>
                            <Icon.EditMessage size={25} color='#828282' focusColor='#10101'/>

                        </>
                    )}
                    <Icon.Like size={25} color='#828282' focusColor='#10101'/>
                    <Icon.Dislike size={25} color='#828282' focusColor='#10101'/>
                </div>                
            ):(
                <div className={style.commentOptions}>{comment.likes}</div>    
            )}

        </main>
    )
}
export{
    Comment
}