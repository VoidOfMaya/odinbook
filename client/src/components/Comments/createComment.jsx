import style from './comment.module.css';
import { Icon } from '../iconhelper/icons';
const CreateComment = ({postId, user}) =>{
    //creates a comment and updates comments !
    return(
        <main className={style.CreateCommentContainer}>
            <title>Post creation pannel</title>
            <form className={style.commentForm}>              
                <textarea placeholder='Whats on your mind today!' />
                <div className={style.commentTabBtn}>
                    <Icon.Send 
                    size={30} color="#646363"  focusColor="#fff" title='Create Post'/>
                </div>
            </form>
            
        </main>
    )
}
export{
    CreateComment
}