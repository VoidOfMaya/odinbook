import { useOutletContext, useParams } from 'react-router-dom'
import style from './profile.module.css'
import { useEffect, useState } from 'react';
import { Icon } from '../../components/iconhelper/icons';

const ProfilePage =({})=>{
    const {userId}= useParams();
    const {auth, callApi}= useOutletContext();
    const [editMode, setEditMode] = useState(false)
    
    //post pagination per user: 
        //required for usePAgenation hook
    const getData = async(cursor= null, limit= 10)=>{
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/me?limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
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

    return(
        <div className={style.mainContainer}>
            <div className={style.userMeta}>
                <div className={style.userPhoto}>
                    {auth?.user?.photo ?(
                        <img src={auth.user.photo}
                            width='200px'
                            height='200px'
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
                   {userId === 'me'? (
                    <p>viewing my own user profile</p>
                   ):(
                    <p>viewing other users profile</p>
                   )}
                    <div className={style.userOptions}>
                    {userId === 'me'? (
                        <>
                            <Icon.EditeProfile />
                        </>
                    ):(
                        <>  
                            <div style={{display: 'flex'}}>+<Icon.Friends /></div>
                            <div style={{display: 'flex'}}>-<Icon.Friends /></div>
                        </>
                    )}                    
                    </div>
                </div>
            </div>
            <div className={style.userposts}>
                
            </div>
        </div>
    )
}
export{
    ProfilePage
}