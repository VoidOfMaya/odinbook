import { useOutletContext } from 'react-router-dom';
import { SideBar } from '../../components/feedSidebar/sidebar';
import style from './feed.module.css';
import { useEffect, useState } from 'react';
import { CreatePost } from '../../components/post/createPost';
import { PostCard } from '../../components/post/postCard';

const FeedPage = ({})=>{
    const {saveFeed,auth, isAuthenticated} = useOutletContext();
    const [user, setUser] = useState(null)
    const fakePost = {
        id: 1,
        content: "i didnt slee super well last night but im happy to be early, nothing like morning rise",
        photoUrl: null,
        createdAt: "03-09-2026",
        editedAt: null,
        visibility: true,
        likes: 16,
        author:{
            id: 2,
            name: "Mathew Boze",
            photo: null,
        },
        comments:[
            {
                id: 1,
                content: "yeah it be like that sometimes so understandable",
                likes: 2,
                author:{
                    id: 15,
                    name: "david Joo",
                    photo:null,   
                }
            },
            {
                id: 2,
                content: "OMG FELTTTTTTT!!!!",
                likes: 16,
                author:{
                    id: auth.user.id,
                    name: auth.user.name,
                    photo:auth.user.photo,   
                }
            },
            {
                id: 3,
                content: "must be that damn phone!",
                likes: 0,
                author:{
                    id: 15,
                    name: "juan ortiga",
                    photo:null,   
                }
            },

        ]

    }
    useEffect(()=>{
        isAuthenticated()
        setUser(auth.user)
    },[])
    return(
        <main className={style.mainContainer}>
            <div className={style.sidebarContainer}>
                <SideBar user={user}/>
            </div>
            <div className={style.contentContainer}>
                <div className={style.postCreate}>
                    <CreatePost />
                    
                </div>
                <div className={style.postContainer}>
                    <PostCard  post={fakePost} auth={auth}/>
                </div>                
            </div>

            
        </main>
    )
}
export{
    FeedPage
}