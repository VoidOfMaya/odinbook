import { Icon } from "../iconhelper/icons"
import style from './sidebar.module.css'
import { usePagenation } from "../../customhooks/usePagination"
const SideBar = ({user, redirect})=>{
    const getData = async(cursor= null, limit= 10)=>{
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/profile/me?limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
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
    const {setReload}= usePagenation(getData)
    //options should include active friends and pending requests
    
    return(
        <main className={style.mainContainer}>
            <div className={style.userDisplay}
                onClick={()=>{        
                    redirect('/profile/me')
                }}
            >
                {user?.photo ?(
                    <img src={user.photo}
                        height={40}
                        width={40}
                        title="visit my profile"
                        style={{borderRadius: '25px', cursor: 'pointer'}} />
                ):(
                    <Icon.User size={40} />
                )}
            </div>
            <div className={style.options}>
                <Icon.Inbox     
                    size={30} color="#646363"  focusColor="rgb(30, 29, 30)" title="My inbox" />
                <Icon.Search    
                    size={30} color="#646363"  focusColor="rgb(30, 29, 30)" title="Search users"/>
                <Icon.Friends   
                    size={30} color="#646363"  focusColor="rgb(30, 29, 30)" title="My friends"/>
                

            </div>
            <div style={{marginTop:'auto',alignSelf: 'center'}}>
                <Icon.Logout size={30} color="#646363"  focusColor="rgb(30, 29, 30)"/>
            </div>
        </main>
    )
}
export{
    SideBar
}