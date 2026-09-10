import { useCallback, useEffect, useRef, useState } from "react";

const usePagenation = (fetchData, enabled = true) =>{
        //define feed management referances
    const observer = useRef();
    const contextRef = useRef(null);
    const nextCursor = useRef(null);
    const hasMore = useRef(true);
    const loadRef = useRef(false);
    const counterRef = useRef(0);

    const [loadData, setLoadData]= useState(false);
    const [data, setData] = useState([]);
    // data altering endpoint
    const updateData = (newData)=>{
        setData(newData)
    }
    const getFirstChunk = async()=>{  
        //HANDELS FIRST CHUNK LOAD
        if (loadRef.current) return;    
        setLoadData(true);
        loadRef.current=true;
        try{
            const result = await fetchData();
            nextCursor.current = result.nextCursor
            hasMore.current = result.hasMore
            setData(result.data)
            setLoadData(false)  
                
        }catch(err){
            console.log(err.message)
        }finally{
            loadRef.current=false;
            setLoadData(false);
        }

    }
    const getNextChunk = async()=>{
        if(loadRef.current) return console.log('exiting getter function');

        loadRef.current = true;
        setLoadData(true);
        try{
            const result  = await fetchData(nextCursor.current);
            nextCursor.current = result.nextCursor
            hasMore.current = result.hasMore
            setData(prevData =>[...prevData,...result.data])  
            setLoadData(false)
        }catch(err){
            console.log(err.message)
        }finally{
            loadRef.current=false;
            setLoadData(false);
        }

    }
    const lastRecordRef = useCallback(dataType =>{
        if(!hasMore.current) return ;
        if(loadData)return;
        if(observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(enteries=>{
            const entry= enteries[0];        
            if(entry.isIntersecting){
                counterRef.current += 1;

                console.log(`fetching from cursor: ${nextCursor.current}`)
                getNextChunk(nextCursor.current)                
            };
        },{
            root: contextRef.current,
            threshold: 0.1
        });
        if(dataType) observer.current.observe(dataType)
    },[loadData, nextCursor])// may not wortk 
    useEffect(()=>{
        if(!enabled) return
        getFirstChunk()
    },[enabled])
    return{
        data,
        updateData,
        cursor: nextCursor.current, 
        hasMore: hasMore.current,
        loadData, 
        contextRef, 
        lastRecordRef
    }
}
export{
    usePagenation
}