//@flow
import { CircularProgress } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { getWorkspaceIdList, getWorkspaces, loadWorkspace } from '../../firebase/storage'
import { useSession } from '../../firebase/UserProvider'
import Workspaces from '../../pages/Workspaces'
import { useUser } from '../user/useUser'

export const WorkspaceContext = React.createContext()



export const WorkspaceProvider = (props) => {

    const [loading, setLoading] = useState(true)
    const [workspace, setWorkspace] = useState()
    const [schema, setSchema] = useState()
    const [wid, setWid] = useState()
    const [widList, setWidList] = useState([])
    const { tenantId } = useUser()

   

    useEffect(()=>{

        return getWorkspaceIdList(tenantId, 
            wids => {
                if(wids.length === 1) {
                    console.log("use the only workspace", wids[0])
                    setWid(wids[0])
                }
                setWidList(wids)
                
            }, 
            error => {
                console.log(`Failed to load workspaces`, error)
            })
    },[tenantId])


    useEffect(()=>{
        if (!wid) return null
        
        setLoading(true)
        return loadWorkspace(tenantId, wid,
            loaded => {
                setWorkspace(loaded)
                setSchema(loaded.schema)
                setLoading(false)
                console.log('Loaded workspace', wid)
            },
            error => console.log(`Failed to load workspace ${wid}`, error))

    }, [tenantId, wid])

    return (
        <WorkspaceContext.Provider value={{wid, workspace, setWid, widList, schema}} >
             { (()=>{
                    if(loading){
                        return (<CircularProgress />)
                    } else if(!wid) {
                        return (<Workspaces/>)
                    } else {
                        return (props.children)
                    }
                })()}            
        </WorkspaceContext.Provider>
    )
}