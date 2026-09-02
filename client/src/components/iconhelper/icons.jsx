import { useState } from "react"
import style from "./icons.module.css"
const User =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='User'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 -960 960 960"
            fill={focuse? focusColor : color}
                onMouseEnter={()=>setFocus(true)}
                onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <title>{title}</title>
            <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm146.5-204.5Q340-521 340-580t40.5-99.5Q421-720 480-720t99.5 40.5Q620-639 620-580t-40.5 99.5Q539-440 480-440t-99.5-40.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm100-95.5q47-15.5 86-44.5-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160q53 0 100-15.5ZM523-537q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm-43-43Zm0 360Z"    
            />
        </svg>
    )
}
const Search =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Search'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            width={`${size}px`}
            fill={focuse? focusColor : color}
                onMouseEnter={()=>setFocus(true)}
                onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
                <title>{title}</title>
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
        </svg>
    )
}
const EditeProfile =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Edit Profile'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`}  
            viewBox="0 -960 960 960" 
            width={`${size}px`}  
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <title>{title}</title>
            <path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Z"
/>
        </svg>
    )  
}
const Block =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Block'}) =>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`}  
            viewBox="0 -960 960 960" 
            width={`${size}px`}  
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <title>{title}</title>
            <path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM480-160q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448ZM480-480Z"/>
        </svg>
    )
}
const ReplyTo =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Replay'})=>{
    const [focuse, setFocus] = useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <title>{title}</title>
            <path d="m600-200-56-57 143-143H300q-75 0-127.5-52.5T120-580q0-75 52.5-127.5T300-760h20v80h-20q-42 0-71 29t-29 71q0 42 29 71t71 29h387L544-624l56-56 240 240-240 240Z"/>
        </svg>
    )
}
const EditMessage =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Edit'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
        </svg>
    )
}
const Delete =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Delete'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`}
            viewBox="0 -960 960 960" 
            width={`${size}px`}
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
            <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>
    )
}
const Logout =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Logout'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg"
            style={{cursor: 'pointer'}}  
            height={`${size}px`}
            viewBox="0 -960 960 960" 
            width={`${size}px`}
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
    )
}
const Plus =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Create'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`}

            viewBox="0 -960 960 960" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
        </svg>
    )
}
const NavIndicator =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='navigation'})=>{

}
const Like =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Like'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            style={{cursor: 'pointer'}} 
            height={`${size}px`}
            viewBox="0 0 640 640" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
                <path d="M144 224C161.7 224 176 238.3 176 256L176 512C176 529.7 161.7 544 144 544L96 544C78.3
                        544 64 529.7 64 512L64 256C64 238.3 78.3 224 96 224L144 224zM334.6 80C361.9 80 384
                        102.1 384 129.4L384 133.6C384 140.4 382.7 147.2 380.2 153.5L352 224L512 224C538.5 
                        224 560 245.5 560 272C560 291.7 548.1 308.6 531.1 316C548.1 323.4 560 340.3 560 
                        360C560 383.4 543.2 402.9 521 407.1C525.4 414.4 528 422.9 528 432C528 454.2 513 
                        472.8 492.6 478.3C494.8 483.8 496 489.8 496 496C496 522.5 474.5 544 448 544L360.1 
                        544C323.8 544 288.5 531.6 260.2 508.9L248 499.2C232.8 487.1 224 468.7 224 449.2L224
                        262.6C224 247.7 227.5 233 234.1 219.7L290.3 107.3C298.7 90.6 315.8 80 334.6 80z"/>
        </svg>
    )
}
const Dislike =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='Dislike'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            // flip thumbs up icon 
            className={style.dislike}
            style={{cursor: 'pointer'}} 
            height={`${size}px`}
            viewBox="0 0 640 640" 
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
                <title>{title}</title>
                <path d="M144 224C161.7 224 176 238.3 176 256L176 512C176 529.7 161.7 544 144 544L96 544C78.3
 544 64 529.7 64 512L64 256C64 238.3 78.3 224 96 224L144 224zM334.6 80C361.9 80 384
  102.1 384 129.4L384 133.6C384 140.4 382.7 147.2 380.2 153.5L352 224L512 224C538.5 
  224 560 245.5 560 272C560 291.7 548.1 308.6 531.1 316C548.1 323.4 560 340.3 560 
  360C560 383.4 543.2 402.9 521 407.1C525.4 414.4 528 422.9 528 432C528 454.2 513 
  472.8 492.6 478.3C494.8 483.8 496 489.8 496 496C496 522.5 474.5 544 448 544L360.1 
  544C323.8 544 288.5 531.6 260.2 508.9L248 499.2C232.8 487.1 224 468.7 224 449.2L224
   262.6C224 247.7 227.5 233 234.1 219.7L290.3 107.3C298.7 90.6 315.8 80 334.6 80z"/>
            </svg>
    )
}
const Github =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='GitHub'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg role="img" 
            style={{cursor: 'pointer'}} 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            height={`${size}px`}
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
                <title>{title}</title>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
    )
}
const Comments =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='comments'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg role="img" 
            style={{cursor: 'pointer'}} 
            viewBox="0 0 640 640"
            xmlns="http://www.w3.org/2000/svg"
            height={`${size}px`}
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
                <title>{title}</title>
            <path d="M576 304C576 436.5 461.4 544 320 544C282.9 544 247.7 536.6 215.9 
                523.3L97.5 574.1C88.1 578.1 77.3 575.8 70.4 568.3C63.5 560.8 62 549.8 66.8 
                540.8L115.6 448.6C83.2 408.3 64 358.3 64 304C64 171.5 178.6 64 320 64C461.4
                64 576 171.5 576 304z"/>
        </svg>
    )
}
const Eye =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='eye'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg role="img"
            style={{cursor: 'pointer'}} 
            viewBox="0 0 640 640"
            xmlns="http://www.w3.org/2000/svg"
            height={`${size}px`}
            width={`${size}px`} 
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
            <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 
            307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 
            507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 
            368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 
            512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 
            176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 
            399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3
            311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 
            412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 
            224.3C316.9 233.6 320 244.4 320 256z"/>
        </svg>
    )
}
const Friends= ({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='friends'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg xmlns="http://www.w3.org/2000/svg" 
            height={`${size}px`} 
            viewBox="0 -960 960 960" 
            title={title}
            width={`${size}px`}
            fill={focuse? focusColor : color}
                onMouseEnter={()=>setFocus(true)}
                onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}>
            <title>{title}</title>
            <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0
            130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51
            6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 
            113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 
            0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 
            0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 
            0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 
            360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z"/>
        </svg>
    )
}
const Send = ({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='send'})=>{
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
            <title>{title}</title>
            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 
            60-240 60v140Zm0 0v-400 400Z"/>
        </svg>
    )
}
const Inbox =({fn = null, color ='#27282c', focusColor='#62646b', size=25, title='inbox'})=>{
    const [focuse, setFocus]= useState(false);
    return(
        <svg role="img"
            style={{cursor: 'pointer'}} 
            viewBox="0 0 640 640"
            xmlns="http://www.w3.org/2000/svg"
            height={`${size}px`}
            width={`${size}px`}
            fill={focuse? focusColor : color}
                    onMouseEnter={()=>setFocus(true)}
                    onMouseLeave={()=>setFocus(false)}
            onClick={()=> fn? fn(): null}
            >
            <title>{title}</title>
            <path d="M155.8 96C123.9 96 96.9 119.4 92.4 150.9L64.6 345.2C64.2 348.2 64 
                351.2 64 354.3L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 
                576 515.3 576 480L576 354.3C576 351.3 575.8 348.2 575.4 345.2L547.6
                150.9C543.1 119.4 516.1 96 484.2 96L155.8 96zM155.8 160L484.3 160L511.7
                352L451.8 352C439.7 352 428.6 358.8 423.2 369.7L408.9 398.3C403.5 409.1 
                392.4 416 380.3 416L259.9 416C247.8 416 236.7 409.2 231.3 398.3L217 
                369.7C211.6 358.9 200.5 352 188.4 352L128.3 352L155.8 160z"/>
            
        </svg>
    )
}
const Icon ={
    User,
    Friends,
    Send,
    Search,
    Block,
    ReplyTo,
    Delete,
    EditeProfile,
    EditMessage,
    Logout,
    Plus,
    Like,
    Dislike,
    Github,
    Comments,
    Eye,
    Inbox

}
export{
    Icon
}