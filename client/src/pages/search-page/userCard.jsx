import style from './search.module.css';
import { Icon } from '../../components/iconhelper/icons';
const  Card = ({data}) =>{
    //handles 4 states:-BLOCKED/ACTIVE/PENDING/DECLINED/NONE
    const handleConnectionOptions = (status) =>{
        return(
            <div className={style.userOptions}>
                {status === 'BLOCKED' &&(
                    <>
                        <Icon.Block color='red' focusColor='red' title='click to unblock'/>                  
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
    return(
        <>
            <div className={style.userCard}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src={data.photo}  
                        height='70px'
                        width='70px'
                    />                             
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