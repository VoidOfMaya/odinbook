import style from './comment.module.css'
import { Icon } from '../iconhelper/icons'
const Comment = ({comment, auth})=>{
    return(
        <main key={comment.id}>
            <div className={style.commentMeta}>
                <div style={{display: 'flex',alignItems:'end'}}>
                    {comment.author.photo? (
                        <img src={comment.author.photo} 
                            height={25}
                            width={25}
                            style={{borderRadius: '20px'}}
                        />
                    ):(
                        <Icon.User size={25} />
                    )}
                    <h5 style={{color:'#454545'}}>@{comment.author.name}</h5>                    
                </div>


                <div className={style.AuthorOptions}>
                    <h6 style={{color:'#8e8e8e'}}>{comment.createdAt}</h6>
                </div>
            </div>
            <div className={style.commentContent}>
                <p>{comment.content}</p>
            </div>
            <div className={style.commentOptions}>
                {comment.author.id === auth?.user?.id&&(
                    <>
                        <Icon.Delete size={25} color='#828282' focusColor='#10101'/>
                        <Icon.EditMessage size={25} color='#828282' focusColor='#10101'/>

                    </>
                )}
                <Icon.Like size={25} color='#828282' focusColor='#10101'/>
                <Icon.Dislike size={25} color='#828282' focusColor='#10101'/>
            </div>
        </main>
    )
}
export{
    Comment
}