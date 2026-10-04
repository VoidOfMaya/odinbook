import { useOutletContext } from 'react-router-dom';
import { Card } from './friendCard';
import style from './friend.module.css';
import { useEffect, useState } from 'react';
import { Icon } from '../../components/iconhelper/icons';
const FriendsList = ({}) =>{
    const {auth, callApi}= useOutletContext();
    const [data, setData]= useState({});
    const [loading, setLoading]= useState(false)
    const getFriends= async()=>{
        try{
            setLoading(true);
            const response = await callApi({
                method: 'GET',
                path: `network/connection?status=ACTIVE`,
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
    },[])
    return(
        <div className={style.mainContainer}>
           {loading?(
            <div><Icon.Spinner /></div>
           ):(
            <div>
                <h2>Friends</h2>
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
    )
}
export{
    FriendsList
}