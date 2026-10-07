import { Icon } from "../iconhelper/icons"
import style from './sidebar.module.css'
import { usePagenation } from "../../customhooks/usePagination"
import { ShowPfp } from "../../helpers/pfpDisplay"
import { useState } from "react"
const SideBar = ({user, redirect, logout})=>{
    const [screenWidth, setScreenWidth]= useState(window.innerWidth );
    return(
        <main className={style.mainContainer}>
            {window.innerWidth > 780 &&
                <div className={style.userDisplay}
                    onClick={()=>{        
                        redirect('/profile/me')
                    }}
                >
                    <ShowPfp size={40} photo={user.photo} />
                </div> 
            }
            <div className={style.options}>
   
                <Icon.Feed 
                    size={50}
                    color="#646363"  
                    focusColor="rgb(30, 29, 30)"
                    title="feed" 
                    fn={()=> redirect('/feed')}
                />                    
                <Icon.Search    
                    size={30} 
                    color="#646363"  
                    focusColor="rgb(30, 29, 30)" 
                    title="Search users"
                    fn={()=>{
                        redirect('/search');
                    }}
                />
                <Icon.Friends   
                    size={30} 
                    color="#646363"  
                    focusColor="rgb(30, 29, 30)" 
                    title="connections"
                    fn={()=>{
                        redirect('/myFriends');
                    }}
                />
            </div>
            {screenWidth >780 && 
                <div style={{marginTop:'auto',alignSelf: 'center'}}>
                    <Icon.Logout 
                        size={30} 
                        color="#646363"  
                        focusColor="rgb(30, 29, 30)" 
                        title="Logout"
                        fn={()=>{
                                console.log('logging out')
                                logout()
                            }
                        }/>
                </div>
            }

        </main>
    )
}
export{
    SideBar
}