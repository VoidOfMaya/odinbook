import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { usePagenation } from '../../customhooks/usePagination'
import { Icon } from '../../components/iconhelper/icons'
import style from './search.module.css'

const Search =({})=>{

    const {
        auth, 
        isAuthenticated, 
        goTo, 
        callApi,
    } = useOutletContext();

    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    //usePagination Hook:
    const getData = async(cursor= null, limit= 10) =>{
        setLoading(true);
        try{
            const response = await callApi({
                method: 'GET',
                path: `user/search?name=${searchInput? searchInput: ""}&limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            setLoading(false);
            if(!response.ok)throw new Error('callApi error could not retrieve data');
            return await response.json()
        }
        catch(err){
            console.log(`Could not get data`)
            console.log(err.message)
            setLoading(false);
        }
        setLoading(false);
    }
    const { 
        issue,    
        data,
        updateData,
        cursor, 
        hasMore,
        loadData, 
        contextRef, 
        trigger,
        lastRecordRef
    } = usePagenation(getData)

    const [result, setResult] = useState([]);
    useEffect(()=>{
        
        trigger();
    },[searchInput])
    useEffect(()=>{
        if(!issue) return
        console.log(data)
        //setResult(data)
    },[data])
    useEffect(()=>{
    },[result])
    return(
        <>
            <div className={style.mainContainer}>
                <div className={style.searchBar}>
                    <input 
                        type='text'
                        value={searchInput}
                        onChange={(e)=>{
                            setSearchInput(e.target.value)
                        }}
                    >

                    </input>
                    <Icon.Search />
                </div>
                <div className={style.searchResults}>
                    {loading?(
                        <Icon.Spinner />
                    ):(
                    <>
                    {data ?(
                        <>
                            {data?.map(user =>{
                                return(
                                    <div key={user.id}>
                                        <div>
                                            <img src={user.photo} />
                                            <div>name: {user.name}</div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={lastRecordRef} />                        
                        </>
                    ):(
                        <div>
                            No Results Found!
                        </div>
                    )}

                    </>
                    )
                    }
                </div>
            </div>
        </>
    )
}
export{
    Search
}