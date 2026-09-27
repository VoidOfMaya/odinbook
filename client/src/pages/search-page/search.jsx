import { useState } from 'react'
import { Icon } from '../../components/iconhelper/icons'
import style from './search.module.css'

const Search =({})=>{
    const {searchInput, setSearchInput} = useState(null);
    const {loading, setLoading} = useState(true);

    return(
        <>
            <div className={style.mainContainer}>
                <div className={style.searchBar}>
                    <input></input>
                    <Icon.Search />
                </div>
                <div className={style.searchResults}>
                    {loading?(
                        <Icon.Spinner color='clack' />
                    ):(<></>)
                    }
                </div>
            </div>
        </>
    )
}
export{
    Search
}