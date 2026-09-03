import style from './post.module.css';
const PostCard = ({post}) =>{

    if(!post){
        return(
            <>Could not populate post</>
        )
    }
    return(
        <main key={post.id}>
            post
        </main>        
    )
}
export{
    PostCard
}