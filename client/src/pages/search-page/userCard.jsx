import style from './search.module.css';
import { Icon } from '../../components/iconhelper/icons';
import {useOutletContext } from 'react-router-dom';
const  Card = ({data}) =>{
    const {auth ,goTo,callApi} = useOutletContext();
    // FRIENDSHIP FUNCTIONS
    const blockUser = async(userId)=>{

    }
    const unblockUser = async(userId)=>{
        
    }
    const declineConnectionReq = async(Id)=>{
        
    }
    const acceptConnectionReq = async(Id)=>{
        
    }
    const terminateConnection = async(id)=>{

    }
    const sendConnectionReq =async(userId)=>{
        
    }

    //handles 4 states:-BLOCKED/ACTIVE/PENDING/DECLINED/NONE
    const handleConnectionOptions = (status) =>{
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

                            }}
                        />                  
                    </>
                )}   
                {status === 'ACTIVE' &&(
                    <>
                        <Icon.Delete title='remove from friends'/>  
                        <Icon.Block title='block'/>              
                    </>
                )}   
                {status === 'PENDING' &&(
                    <>
                        <Icon.Plus title='accept friend request' />
                        <Icon.Delete title='decline friend request'/>  
                        <Icon.Block title='block'/>              
                    </>
                )} 
                {(status === 'DECLINED' || status === 'NONE') &&(
                    <>
                        <Icon.Plus title='send friend request' />
                        <Icon.Block title='block'/>              
                    </>
                )}    
            </div>
            
        )
    }
    const handlePrivacy = (user)=>{
        if(user.connection === 'ACTIVE') return true //if friendship exists go to user regardless
        if(user.isPrivate) return false //if privacy is true then return false  to disable interaction
        return true
    }
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
                                alert('can not view private user, request to connect to be able to view user profile')
                            )
                        }}
                    >
                        <title>view profile</title>
                        {handlePrivacy(data) && data.photo? (
                            <img src={data.photo}  
                                height='70px'
                                width='70px'
                                style={{
                                    cursor: 'pointer',
                                    border: `1px solid ${data.isPrivate ? 'red': 'green'}`
                                }}
                            /> 
                        ):(
                            <Icon.User size={70} title='view Profile'/>
                        )}                        
                    </div>

                            
                    <div>@{data.name}</div>                                             
                </div>
                <div>
                   {data.connection} 
                </div>
                <div>
                   {handleConnectionOptions(data.connection)} 
                </div>
                
            </div>
        </>
    )
}
export{
    Card
}