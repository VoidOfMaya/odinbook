import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { usePagenation } from '../../customhooks/usePagination'
import { Icon } from '../../components/iconhelper/icons'
import style from './search.module.css'
import { Card } from './userCard'

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
    useEffect(()=>{
    },[data])
    useEffect(()=>{
        if(issue)console.log(issue)
    },[issue])
    return(
        <>
            <div className={style.mainContainer}>
                <div className={style.searchBar}>
                    <input 
                        type='text'
                        value={searchInput}
                        onChange={(e)=>{
                            setSearchInput(e.target.value)
                            trigger()
                        }}
                    >

                    </input>
                    <Icon.Search />
                </div>
                <div className={style.searchResults} ref={contextRef}>
                    {loading?(
                        <Icon.Spinner />
                    ):(
                        <>
                            {data ?(
                                <>
                                    <div className={style.tableHead}>
                                        <div>User</div>
                                        <div>Status</div>
                                        <div>Options</div>
                                    </div>
                                    {data?.map(user =>{
                                        return(
                                            <Card key={user.id} data={user} />
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
                    )}
                    <div ref={lastRecordRef}></div>
                </div>
            </div>
        </>
    )
}
export{
    Search
}