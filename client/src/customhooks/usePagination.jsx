import { useCallback, useEffect, useRef, useState } from "react";

const usePagenation = (getData) =>{
        //define feed management referances
    const observer = useRef();
    const contextRef = useRef(null);
    const nextCursor = useRef(null);
    const hasMore = useRef(true);
    const loadRef = useRef(false);
    const counterRef = useRef(0);
    const [loadData, setLoadData]= useState(false);

    const getFirstFeedChunk = async()=>{  
        //HANDELS FIRST CHUNK LOAD
        if (loadRef.current) return;    
        setLoadPosts(true);
        loadRef.current=true;
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=10`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not retrieve feed');
            const result = await response.json(); 
            nextCursor.current = result.nextCursor
            hasMore.current = result.hasMore
            setPosts(result.feed)
            setLoadPosts(false)  
                
        }catch(err){
            console.log(err.message)
        }finally{
            loadRef.current=false;
            setLoadPosts(false);
        }

    }
    const getNextFeedChunk = async(cursor)=>{
        if(loadRef.current) return console.log('exiting feedGetter function');

        loadRef.current = true;
        setLoadPosts(true);
        try{
            const response = await callApi({
                method: 'GET',
                path: `feed/?limit=10&cursor=${cursor}`,
                requiresAuth: true,
                //body: options.body,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })
            if(!response.ok)throw new Error('Could not retrieve feed');
            const result = await response.json(); 
            //console.log(result)
            nextCursor.current = result.nextCursor
            hasMore.current = result.hasMore
            setPosts(prevPost =>[...prevPost,...result.feed])  
            setLoadPosts(false)
        }catch(err){
            console.log(err.message)
        }finally{
            loadRef.current=false;
            setLoadPosts(false);
        }

    }

    const lastRecordRef = useCallback(post =>{
        if(!hasMore.current) return ;
        if(loadata)return;
        if(observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(enteries=>{
            const entry= enteries[0];        
            if(entry.isIntersecting){
                counterRef.current += 1;

                console.log(`fetching from cursor: ${nextCursor.current}`)
                getNextFeedChunk(nextCursor.current)                
            };
        },{
            root: contextRef.current,
            threshold: 0.1
        });
        if(post) observer.current.observe(post)
    },[loadData, nextCursor])// may not wortk 
    return{contextRef, lastRecordRef}
}
export{
    usePagenation
}