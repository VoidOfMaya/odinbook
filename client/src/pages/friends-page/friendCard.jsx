
import style from './friend.module.css';
import { Icon } from '../../components/iconhelper/icons';
import {useOutletContext } from 'react-router-dom';
import { ShowPfp } from '../../helpers/pfpDisplay';
const  Card = ({user, meta}) =>{
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
    //handles 4 states:-BLOCKED/ACTIVE/PENDING/DECLINED/NONE
    const handleConnectionOptions = (meta, id) =>{
        return(
            <div className={style.userOptions}>
                {meta.status === 'ACTIVE' &&(
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
            </div>
            
        )
    }

    return(
        <>
            <div className={style.userCard}>
                <div className={style.friendInfo}>
                    <div
                        onClick={()=>{
                            goTo(`/profile/${user.id}`)
                        }}
                    >
                        <title>view profile</title>
                        < ShowPfp photo={user.photo} size={70}/>
                    </div>  
                    <div>@{user.name}</div>                                             
                </div>
                <div></div>
                <div>
                   {handleConnectionOptions(meta, user.id)} 
                </div>
                
            </div>
        </>
    )
}
export{
    Card
}