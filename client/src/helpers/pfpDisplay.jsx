const ShowPfp = ({photo, size= 50, title= 'view profile', fn}) =>{
return(
<div onClick={()=> fn? fn(): null}>
    {photo? (
        <img src={photo}  
            height={`${size}px`}
            width={`${size}px`}
            style={{cursor: 'pointer'}}
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