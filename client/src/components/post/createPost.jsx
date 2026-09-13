import { useEffect, useState } from 'react';
import { Icon } from '../iconhelper/icons';
import style from './post.module.css';
import { useOutletContext } from 'react-router-dom';
const CreatePost = ({updatePost}) =>{
    const {auth, callApi}= useOutletContext();
    const [newPost, setNewPost] = useState({content:'',photo:null});
    const [isSending, setIsSending]= useState(false);
    //create new post
    const  uploadPost = async() =>{
        setIsSending(true)
        try{        
            const response = await callApi({
                method: 'POST',
                path: `post/`,
                requiresAuth: true,
                body: {
                    photo: newPost.photo,
                    content: newPost.content
                },
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not upload post')
            const result = await response.json();
            updatePost(result.post)
        }catch(err){
            console.log(err.message)
        }
        setIsSending(false)
    }
    useEffect(()=>{
        
    },[newPost])
    return(
        <main className={style.CreatePostContainer}>
            <title>Post creation pannel</title>
            <form className={style.postForm}>
                <input type='file' id='photo' style={{display: 'none'}}/>
                <label htmlFor='photo' className={style.photoTabBtn}>
                    <Icon.AddPhoto 
                    size={30} color="#646363"  focusColor="rgb(30, 29, 30)" title='Add photo'/>
                </label>
                
                <textarea 
                    placeholder='Whats on your mind today!' 
                    onChange={(e)=>{
                        setNewPost(prev=>({
                            ...prev,content: e.target.value
                        }));
                    }}
                />

                <div className={style.postTabBtn}>
                    {isSending
                        ?(
                            <div style={{position: 'absolute'}}>
                                <Icon.Spinner size={10} />
                            </div>
                        ):(
                        <Icon.Send 
                        size={30} color="#646363"  focusColor="#fff" title='Create Post'
                        fn={()=>{
                            uploadPost()
                        }}/>                            
                        )}

                </div>
            </form>
            
        </main>
    )
}
export{
    CreatePost
}