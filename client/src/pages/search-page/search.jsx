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
    }
    //if search input is empty disable pagiantion
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
    //populate screen
    useEffect(()=>{

    },[data])
    const populateResults = (data)=>{

        if(!data && loading){
            return(
                <div className={style.scrollContainer}> 
                    <div style={{alignSelf: 'center', margin: 'auto'}}>
                        <Icon.Spinner color='rgb(56, 56, 56)'/>
                    </div>
                </div>
            )
        }
        if(!data && !loading){
            return(
                <div className={style.scrollContainer}> 
                    <div style={{alignSelf: 'center'}}>
                        No Results Found!
                    </div>
                </div>
            )
        }
        return(
            <div ref={contextRef} className={style.scrollContainer}>
                    {data?.map((user, index) =>{
                        if(user.id === auth.user.id)return
                        return(
                            <div key={user.id}>
                                {data.length -  1 === index  && (
                                    <div ref={lastRecordRef}/>  
                                )}
                                <Card  data={user} />
                            </div>

                        )
                    })}   
                    {!hasMore  && (
                        <div style={{display: 'flex',justifyContent: 'center'}}>
                            No more posts! 
                        </div>   
                    )}
                    {loadData && (
                        <div>
                            <Icon.Spinner />
                        </div>
                    )}                   
            </div>
        )
    }
    //intialize a socket io event listener to refetch data when a user to user connection changes
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
                        placeholder='enter username to search'
                        onChange={(e)=>{
                            setSearchInput(e.target.value)
                            trigger()
                        }}
                    >

                    </input>
                    <Icon.Search />
                </div>
                <div className={style.searchResults}>
                    <div className={style.tableHead}>
                        <div>User</div>
                        <div>Status</div>
                        <div>Options</div>
                    </div>
                    {populateResults(data)}
                </div>
            </div>
        </>
    )
}
export{
    Search
}