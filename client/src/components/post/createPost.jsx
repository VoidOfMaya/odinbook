import { useEffect, useState } from 'react';
import { Icon } from '../iconhelper/icons';
import style from './post.module.css';
import { useOutletContext } from 'react-router-dom';
const CreatePost = ({updatePost}) =>{
    const {auth, callApi}= useOutletContext();
    const [newPost, setNewPost] = useState({content:'',photo:null});
    const [isSending, setIsSending]= useState(false);

    //photo handelling state
    const [previewUrl, setPreviewUrl]= useState(null)
    //create new post
    const  uploadPost = async() =>{
        setIsSending(true)
        console.log(newPost.content)
        try{  
            //turning newpost to formData
            const formData = new FormData();
            formData.append('content', newPost.content);
            formData.append('photo', newPost.photo);
            console.log(formData)
            //sending call to server
            const response = await callApi({
                method: 'POST',
                path: `post/`,
                requiresAuth: true,
                body: formData,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not upload post')
            const result = await response.json();
            updatePost(prev =>[result.post, ...prev])
        }catch(err){
            console.log(err.message)
        }
        setIsSending(false);
        setPreviewUrl(null);
        setNewPost({content:'',photo:null})
    }
    useEffect(()=>{
        if (!newPost.photo) {
            //if photo is deselected/is null then set preview to null
            setPreviewUrl(null);
            return;
        }
        //handells setting a preview image  when a photo is selected
        const url = URL.createObjectURL(newPost.photo);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    },[newPost.photo])
    return(
        <main className={style.CreatePostContainer}>
            <title>Post creation pannel</title>
            <form className={style.postForm}>
                <input 
                    type='file' 
                    id='photo' 
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={(e)=>{
                        const file = e.target.files[0];
                        if(!file) return;
                        if(!file.type.startsWith('image/')){
                            console.warn('file type error: please select a photo file')
                            return;
                        }

                        setNewPost(prev =>({
                            ...prev,photo: file
                        }))
                    }}/>
                {!previewUrl?
                    (
                        <label htmlFor='photo' className={style.photoTabBtn}>
                            <Icon.AddPhoto 
                                size={30} 
                                color="#646363"  
                                focusColor="rgb(30, 29, 30)" 
                                title='Add photo'
                            />                        
                        </label>
                    ):(
                        <div className={style.photoPreviewContainer}>
                            <img 
                                src={`${previewUrl}`} 
                                className={style.previewImg}
                            />
                            <div 
                                style={{
                                    position: 'absolute',top: "0",
                                    left: '-50px'
                                }}
                            >
                                <Icon.Delete 
                                    title='Deselect photo'
                                    color='rgba(197, 198, 197, 0.99)'
                                    focusColor='rgba(254, 254, 254, 0.99)'
                                    size={40}
                                    fn={()=>{
                                        setNewPost(prev=>({
                                            ...prev,photo: null
                                        }));
                                    }}
                                />                                
                            </div>
                        </div>
                    )
                }

                
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