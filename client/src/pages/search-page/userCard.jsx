import style from './search.module.css';
import { Icon } from '../../components/iconhelper/icons';
import {useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { ShowPfp } from '../../helpers/pfpDisplay';
const  Card = ({data}) =>{
    const {auth ,goTo,callApi} = useOutletContext();
    // FRIENDSHIP FUNCTIONS
    const updateConnection = async(id, status)=>{
        //handle state updates after preforming action
        //send an event to update the firendslist channel
        //send event to refresh  list of search users
        try{
            const response = await callApi({
                method: 'PATCH',
                path: `network/connection/${id}`,
                requiresAuth: true,
                body: {updateStatus: status},
                token: auth.accessToken,
                retry: true,
                includeCred:true
            });
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            return await response.json();
        }catch(err){
            console.log(err.message);
        }
    }
    const sendConnectionReq =async(userId, status)=>{
        //handle state updates after preforming action
        //send an event to update the inbox channel
        //send event to refresh  list of search users
        try{
            const response = await callApi({
                method: 'POST',
                path: 'network/connection',
                requiresAuth: true,
                body: {
                    recipiantId: userId,
                    status: status
                },
                token: auth.accessToken,
                retry: true,
                includeCred:true
            });
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            return await response.json();
        }catch(err){
            console.log(err.message);
        }
    }

    //handles 4 states:-BLOCKED/ACTIVE/PENDING/DECLINED/NONE
    const handleConnectionOptions = (connection, userId) =>{
        const {status, id} = connection;
        return(
            <div className={style.userOptions}>
                {status === 'BLOCKED' &&(
                    <>
                        <Icon.Block 
                            color='red' 
                            focusColor='red' 
                            title='click to unblock'
                            fn={async()=>{
                                const confirm = window.confirm('this action will unblock a user and allow them to interact with you again')
                                if(!confirm) return
                                updateConnection(id, "DECLINED");
                            }}
                        />                  
                    </>
                )}   
                {status === 'ACTIVE' &&(
                    <>
                        <Icon.Delete title='remove from friends'
                            fn={()=>{
                                const confirm = window.confirm(' this actioin will terminate the friendship')
                                if(!confirm) return
                                updateConnection(id, "DECLINED");
                            }}
                        />  
                        <Icon.Block title='block'
                            fn={()=>{
                                const confirm = window.confirm(' this actioin will terminate friendship and BLOCK user')
                                if(!confirm) return
                                updateConnection(id, "DECLINED");
                                updateConnection(id, "BLOCKED");

                            }}
                        />              
                    </>
                )}   
                {status === 'PENDING' &&(
                    <>
                        <Icon.Plus title='accept friend request' 
                            fn={()=>{
                                updateConnection(id, "ACTIVE")
                            }}
                        />
                        <Icon.Delete title='decline friend request'
                            fn={()=>{
                                updateConnection(id, "DECLINED")
                            }}
                        />  
                        <Icon.Block title='block'
                            fn={()=>{
                                const confirm = window.confirm(' this actioin will BLOCK user')
                                if(!confirm) return
                                updateConnection(id, "BLOCKED");

                            }}
                        />              
                    </>
                )} 
                {(status === 'DECLINED' || status === 'NONE') &&(
                    <>
                        <Icon.Plus title='send friend request' 
                        fn={()=>{
                            sendConnectionReq(userId)
                        }}/>
                        <Icon.Block title='block'
                            fn={async()=>{
                                const confirm = window.confirm(' this action will BLOCK user')
                                if(!confirm) return
                                if(status === 'NONE'){
                                   return sendConnectionReq(id, "BLOCKED");
                                }
                                updateConnection(id, "BLOCKED");

                            }}
                        />              
                    </>
                )}    
            </div>
            
        )
    }
    const handlePrivacy = (user)=>{
        if(user.isPrivate ) return false //if privacy is true then return false  to disable interaction
        if(user.connection.status === 'BLOCKED')return false// cases where user has blocked the other user
        if(user.connection.status === 'ACTIVE') return true //if friendship exists go to user regardless
        return false
    }
    useEffect(()=>{
        //console.log(data)
    },[])
    return(
        <>
            <div className={style.userCard}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div
                        onClick={()=>{
                            if(handlePrivacy(data)){
                                data.id === auth.user.id
                                    ? goTo(`/profile/me`)
                                    : goTo(`/profile/${data.id}`)
                            }else(
                                alert('can not view Private or Blocked user, request to connect to be able to view user profile')
                            )
                        }}
                    >
                        <title>view profile</title>
                        <ShowPfp 
                            photo={data.photo}
                            size={70}
                            title='View PRofile'
                            status={data.connection.status === "BLOCKED"? false : true}
                        />                        
                    </div>
                    <div>@{data.name}</div>                                             
                </div>
                <div>
                   {data.connection.status} 
                </div>
                <div>
                   {handleConnectionOptions(data.connection, data.id)} 
                </div>
                
            </div>
        </>
    )
}
export{
    Card
}