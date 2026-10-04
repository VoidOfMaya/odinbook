import { Icon } from "../components/iconhelper/icons"

const ShowPfp = ({photo, status= true, size= 50, title= 'view profile', fn}) =>{
return(
<div onClick={()=> fn? fn(): null}>
    {status &&photo? (
        <img src={photo}  
            height={`${size}px`}
            width={`${size}px`}
            style={{cursor: 'pointer', borderRadius: `${size / 2}px`}}
        /> 
    ):(
         <Icon.User size={size} title={title}/>
     )}     
</div>
)
}
export{
    ShowPfp
}