import { useOutletContext } from 'react-router-dom';
import { Card } from './friendCard';
import style from './friend.module.css';
import { useEffect, useState } from 'react';
import { Icon } from '../../components/iconhelper/icons';
const FriendsList = ({}) =>{
    const {auth, callApi}= useOutletContext();

    const [typeOption, setTypeOption] = useState("ACTIVE");
    const [data, setData]= useState({});
    const [loading, setLoading]= useState(false)
    const getFriends= async()=>{
        try{
            setLoading(true);
            const response = await callApi({
                method: 'GET',
                path: `network/connection?status=${typeOption}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            });
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            const result =  await response.json();
            setData(result);
            setLoading(false);
        }
        catch(err){
            console.log(`Could not get data`);
            console.log(err.message);
            setLoading(false);
        }
    }
    useEffect(()=>{
        getFriends()
    },[]);
    useEffect(()=>{
        if(!data) return;
        console.log(data)
        
    },[data]);
    useEffect(()=>{
        getFriends()
    },[typeOption]);
    return(
        <div className={style.mainContainer}>
            <div>
                <div className={style.statusType}>
                    <h3 
                        className={typeOption === 'ACTIVE'? style.optionOn : style.optionOff}
                        onClick={()=>{
                            if(typeOption !== 'ACTIVE')
                            setTypeOption('ACTIVE')
                        }}
                    >
                        Friends
                    </h3>
                    <h3 
                        className={typeOption === 'PENDING'? style.optionOn : style.optionOff}
                       onClick={()=>{
                            if(typeOption !== 'PENDING')
                            setTypeOption('PENDING')
                        }}
                    >
                        pending
                    </h3>
                    <h3 
                        className={typeOption === 'BLOCKED'? style.optionOn : style.optionOff}
                       onClick={()=>{
                            if(typeOption !== 'BLOCKED')
                            setTypeOption('BLOCKED')
                        }}
                    >
                        Blocked
                    </h3>                    
                </div>
           {loading ?(
            <div style={{ display: 'flex',justifyContent: 'center'}}>
                <Icon.Spinner />
            </div>
            ):(
                <div className={style.cardsContainer}> 
                    {data.friends?(
                        <>
                            {data?.friends.map((connection) =>{
                                if(connection.user.id === auth.user.id)return
                                return(
                                    <div key={connection.meta.connectionId}>
                                        <Card  user={connection.user} meta={connection.meta} />
                                    </div>
                                )
                            })} 
                        </>
                    ):(
                        <>no friendships found</>
                    )}

                </div>
            )}                                  
            </div> 
            
        </div>
    )
}
export{
    FriendsList
}