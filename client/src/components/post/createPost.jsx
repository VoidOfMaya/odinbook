import { Icon } from '../iconhelper/icons';
import style from './post.module.css';
const CreatePost = ({}) =>{
    return(
        <main className={style.CreatePostContainer}>
            <title>Post creation pannel</title>
            <form className={style.postForm}>
                <input type='file' id='photo' style={{display: 'none'}}/>
                <label htmlFor='photo' className={style.photoTabBtn}>
                    <Icon.AddPhoto 
                    size={30} color="#646363"  focusColor="rgb(30, 29, 30)" title='Add photo'/>
                </label>
                
                <textarea placeholder='Whats on your mind today!' />
                <div className={style.postTabBtn}>
                    <Icon.Send 
                    size={30} color="#646363"  focusColor="#fff" title='Create Post'/>
                </div>
            </form>
            
        </main>
    )
}
export{
    CreatePost
}