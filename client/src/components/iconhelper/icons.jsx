import { useState } from "react"
import style from "./icons.module.css"
const User =({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 -960 960 960"
            fill={focuse? focusColor : color}
                onMouseEnter={()=>setFocus(true)}
                onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm146.5-204.5Q340-521 340-580t40.5-99.5Q421-720 480-720t99.5 40.5Q620-639 620-580t-40.5 99.5Q539-440 480-440t-99.5-40.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm100-95.5q47-15.5 86-44.5-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160q53 0 100-15.5ZM523-537q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm-43-43Zm0 360Z"    
            />
        </svg>
    )
}
const Search = ({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            width={`${size}px`}
            fill={focuse? focusColor : color}
                onMouseEnter={()=>setFocus(true)}
                onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
        </svg>
    )
}
const EditeProfile = ({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`}  
            viewBox="0 -960 960 960" 
            width={`${size}px`}  
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Z"
/>
        </svg>
    )  
}
const Block = ({fn = null, color ='#27282c', focusColor='#62646b', size=25}) =>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`}  
            viewBox="0 -960 960 960" 
            width={`${size}px`}  
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM480-160q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448ZM480-480Z"/>
        </svg>
    )
}
const ReplyTo = ({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus] = useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <path d="m600-200-56-57 143-143H300q-75 0-127.5-52.5T120-580q0-75 52.5-127.5T300-760h20v80h-20q-42 0-71 29t-29 71q0 42 29 71t71 29h387L544-624l56-56 240 240-240 240Z"/>
        </svg>
    )
}
const EditMessage =({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
        >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
        </svg>
    )
}
const Delete = ({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`}
            viewBox="0 -960 960 960" 
            width={`${size}px`}
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            ><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>
    )
}
const Logout =({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`}
            viewBox="0 -960 960 960" 
            width={`${size}px`}
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            ><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
    )
}
const Plus =({fn = null, color ='#27282c', focusColor='#62646b', size=25})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`}
            viewBox="0 -960 960 960" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
        </svg>
    )
}
const NavIndicator =({})=>{}
const Like =({})=>{}
const Dislike =({})=>{}
const Github =({})=>{}

const Icon ={
    User,
    Search,
    Block,
    ReplyTo,
    Delete,
    EditeProfile,
    EditMessage,
    Logout,
    Plus,

}
export{
    Icon
}