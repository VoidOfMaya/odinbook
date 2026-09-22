import { useOutletContext, useParams } from 'react-router-dom'
import style from './profile.module.css'
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/iconhelper/icons';
import { usePagenation } from '../../customhooks/usePagination';
import { PostCard } from '../../components/post/postCard';

const ProfilePage =({})=>{
    const {userId}= useParams();
    const {
        auth,
        updateAuthUser,
        callApi, 
        activePost, 
        selectPost, 
        resetPost
    }= useOutletContext();
    
    const fileRef = useRef(null);
    //user metadata states
    const [editMode, setEditMode] = useState(false)
    const [previewUrl, setPreviewUrl]= useState(null)
    const [isSending, setIsSending]= useState(false);

    const [ userMeta, setUserMeta] = useState({
        name: auth.user.name,
        bio: auth.user.bio,
        photo:auth.user.photo,
    })
    //post states
    const dialogRef = useRef(null);
    const [myPosts, setMyPosts]= useState([]);
    const [loadPosts, setLoadPosts]= useState(false);

    //post pagination per user: 
        //required for usePAgenation hook
    const getData = async(cursor= null, limit= 10)=>{
        const id = userId === 'me'
            ? auth.user.id
            :userId
        try{
            if(id === undefined) throw new Error('no valid id provided ')
            const response = await callApi({
                method: 'GET',
                path: `feed/profile/${id}?limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            return await response.json()
        }
        catch(err){
            console.log(`Could not get data`)
            console.log(err.message)
        }
    }
    const {     
        data,
        updateData,
        cursor, 
        hasMore,
        loadData, 
        contextRef, 
        lastRecordRef
    } = usePagenation(getData)
    //handle edit user profile 
    const handleUserEdit = async(data) =>{
        //check if edit info is different then authenticated user data
        const updateData = new FormData();

        //if no change found assign field as empty string else 
        //assign changed data to upload object
        //handle photo upload
        setIsSending(true)
        console.log(userMeta)
        try{  
            //turning newpost to formData
            updateData.append('name', userMeta.name === auth.user.name? '': userMeta.name);
            updateData.append('bio', userMeta.bio === auth.user.bio? '': userMeta.bio);
            updateData.append('photo', userMeta.photo === auth.user.photo? '': userMeta.photo);
            console.log(updateData)
            //sending call to server
            const response = await callApi({
                method: 'PATCH',
                path: `user/me`,
                requiresAuth: true,
                body: updateData,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not upload post')
            const result = await response.json();
            const updated = result.userData
            // if update successfull update user dat at app auth.user level
            updateAuthUser(updated.name,updated.bio,updated.photo)
            setNewPost({content:'',photo:null})
            fileRef.current.value = ''
        }catch(err){
            console.log(err.message)
        }
        setIsSending(false);
    }
    useEffect(()=>{
        console.log(userId)
        if(userId === "me"){
            //fetch and paginate user post data
        }
        if(userId !== "me" && userId !== undefined){
            //fetch selected user data
            //fetch and paginate user post data
        }
        
    },[userId])
    {/* update user profile if auth.user cahnges
    useEffect(()=>{
        if(!auth) return
    },[auth.user])*/}
    useEffect(()=>{
        if(!data) return
        setMyPosts(data)
        //console.log(data)
    },[data])
    useEffect(()=>{
        if(!userMeta) return
        //console.log(userMeta)
    },[userMeta])
    useEffect(()=>{
        if (userMeta.photo === auth.user.photo) {
            //if photo is deselected/is null then set preview to null
            setPreviewUrl(null);
            return;
        }
        //handells setting a preview image  when a photo is selected
        const url = URL.createObjectURL(userMeta.photo);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    },[userMeta.photo])
    return(
        <div className={style.mainContainer}>
            <div className={style.contentContainer}>
                <div className={style.userMeta}>
                    {editMode? (
                        <>
                            <div className={style.userPhoto}>
                                <input 
                                    ref={fileRef}
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
                                        setUserMeta(prev =>({
                                            ...prev,photo: file
                                        }))
                                    }}/>
                                {!previewUrl?
                                    (
                                        <>
                                            <label htmlFor='photo' 
                                                style={{
                                                    position: 'absolute',
                                                    top: "0",
                                                    left: '0'
                                            
                                                }}
                                            >
                                                <Icon.AddPhoto 
                                                    size={30} 
                                                    color="#646363"  
                                                    focusColor="rgb(30, 29, 30)" 
                                                    title='Add photo'
                                                />                        
                                            </label>
                                            {auth?.user?.photo ?(
                                                <img src={auth.user.photo}
                                                    width='200em'
                                                    height='200em'
                                                    style={{
                                                        border: '4px solid rgb(183, 183, 183)',
                                                        borderRadius: '100px',
                                                    }}
                                                />
                                            ):(
                                                <Icon.User size={200} />                        
                                                ) 
                                            }
                                        </>
                                    ):(
                                        <div>
                                            <img 
                                                src={`${previewUrl}`} 
                                                width='200em'
                                                height='200em'
                                                style={{
                                                    border: '4px solid rgb(183, 183, 183)',
                                                    borderRadius: '100px',
                                                }}
                                            />
                                            <div 
                                                style={{
                                                    position: 'absolute',top: "0",
                                                    left: '0'
                                                }}
                                            >
                                                <Icon.Delete 
                                                    title='Deselect photo'
                                                    color='rgba(197, 198, 197, 0.99)'
                                                    focusColor='rgba(254, 254, 254, 0.99)'
                                                    size={40}
                                                    fn={()=>{
                                                        setUserMeta(prev=>({
                                                            ...prev,photo: auth.user.photo
                                                        }));
                                                    }}
                                                />                                
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                            <div className={style.userInfo}>

                            <h3 style={{color: 'rgb(93, 93, 93)', textAlign:'start'}}>
                                @<input value={userMeta.name}
                                    onChange={(e)=>{
                                        setUserMeta(prev=>({...prev,name: e.target.value}))
                                }}>   
                                </input>
                            </h3>
                            <h4 style={{color: 'rgb(93, 93, 93)', textAlign:'start', position: 'relative'}}>
                                Bio:
                                </h4>
                                <textarea value={userMeta.bio}
                                    onChange={(e)=>{
                                        setUserMeta(prev=>({...prev,bio: e.target.value}))
                                }}>
                                </textarea>
                                <div className={style.userOptions} >
                                {isSending?(
                                        <div style={{position: 'absolute'}}>
                                            <Icon.Spinner size={10} />
                                        </div>
                                    ):(
                                        <>
                                            {/*<Icon.Send 
                                            size={30} color="#646363"  focusColor="#fff" title='Create Post'
                                            fn={()= >{
                                                uploadPost()
                                                setPreviewUrl(null);
                                            }}/>*/}  
                                            <button type='button'
                                                onClick={()=>{
                                                    handleUserEdit()
                                                }}
                                            >Save changes</button> 
                                        </>                         
                                )}
                                    <Icon.Logout title='Exit Edit mode' fn={()=>{
                                        setEditMode(false)
                                    }}/>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        color: userMeta.bio.length > 150
                                            ? 'rgb(255, 35, 35)'
                                            : 'rgb(128, 129, 128)'
                                    }}>
                                        150/{userMeta.bio.length}
                                    </div>
                                </div>
                            </div>                           
                        </>
                    ):(
                        <>
                            <div className={style.userPhoto}>
                                {auth?.user?.photo ?(
                                    <img src={auth.user.photo}
                                        width='200em'
                                        height='200em'
                                        style={{
                                            border: '4px solid rgb(183, 183, 183)',
                                            borderRadius: '100px',
                                        }}
                                    />
                                ):(
                                    <Icon.User size={200} />                        
                                    ) 
                                }

                            </div>
                            <div className={style.userInfo}>
                            <h3 style={{color: 'rgb(93, 93, 93)', textAlign:'start'}}>
                                @{auth.user.name}
                                </h3>
                            <h4 style={{color: 'rgb(93, 93, 93)', textAlign:'start'}}>
                                Bio:
                                </h4>
                                <p>{auth.user.bio}</p>
                                <div className={style.userOptions}>
                                {userId === 'me'? (
                                    <>
                                        <Icon.EditeProfile fn={()=>{
                                            setEditMode(true)
                                        }}/>
                                    </>
                                ):(
                                    <>  
                                        <div style={{display: 'flex'}}>+<Icon.Friends /></div>
                                        <div style={{display: 'flex'}}>-<Icon.Friends /></div>
                                    </>
                                )}                    
                                </div>
                            </div>                        
                        </>
                    )}

                </div>
            
                <div className={style.userPosts}>
                    {myPosts? (
                        myPosts.map((post, index)=>{
                            if(Number(myPosts.length - 1) === Number(index)){                            
                                return(
                                    <>
                                       
                                            <div ref={lastRecordRef} />  
                                            <PostCard key={post.id}  
                                            post={post} 
                                            user={auth.user} 
                                            dialog={dialogRef}
                                            selectPost={selectPost}
                                            updatePost={updateData}
                                            /> 
                                                                            
                                        {!hasMore  && (
                                            <div style={{display: 'flex',justifyContent: 'center'}}>
                                                No more posts! 
                                            </div>   
                                        )}
                                        {loadData && (
                                            <div>
                                                <Icon.Spinner />
                                            </div>
                                        )}
                                    </>                                          
                                )
                            }else{
                                return(             
                                    <PostCard key={post.id}  
                                        post={post} 
                                        user={auth.user} 
                                        dialog={dialogRef}
                                        selectPost={selectPost}
                                        updatePost={updateData}
                                    />
                                )  
                            }                          
                        })

                    ):(
                        <h2 style={{color:"#aeaeae"}}>No Posts Found!</h2>
                    )}
                    {loadPosts &&(
                        <>
                            <Icon.Spinner />
                            LOADING POSTS ...
                        </>
                    )}
                </div>
            </div>
            {activePost && (
                <PostDialog 
                    ref={dialogRef} 
                    postId={activePost} 
                    reset={resetPost}
                    isActive={!!activePost}
                    deactivate = {selectPost}
                    update={updateData}/>     
            )}

        </div>
    )
}
export{
    ProfilePage
}