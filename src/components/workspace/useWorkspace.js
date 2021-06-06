//@flow
import {CircularProgress} from '@material-ui/core'
import React, {createContext, useContext, useEffect, useState} from 'react'
import {getWorkspaceIdList, loadWorkspace} from '../../firebase/storage'
import Workspaces from '../../pages/Workspaces'
import {useUser} from '../user/useUser'

export const WorkspaceContext = createContext()

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext)
    return { ...context}
}

export const WorkspaceProvider = (props) => {

    const [loading, setLoading] = useState(true)
    const [workspace, setWorkspace] = useState()
    const [schema, setSchema] = useState()
    const [wid, setWid] = useState()
    const [widList, setWidList] = useState([])
    const { tenantId } = useUser()


    useEffect(()=>{

        setLoading(true)
        return getWorkspaceIdList(tenantId, 
            wids => {
                
                setWidList(wids)
                if(wids.length === 1) {
                    console.log("use the only workspace", wids[0])
                    setWid(wids[0])
                } else {
                    setLoading(false)
                }
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
                // setSchema(loaded.schema)
                setLoading(false)
                console.log('Loaded workspace', wid, loaded)
            },
            error => console.log(`Failed to load workspace ${wid}`, error))

    }, [tenantId, wid])

    return (
        <WorkspaceContext.Provider value={{wid, workspace, setWid, widList, schema, tenantId}} >
             { (()=>{
                    if(loading){
                        return (<CircularProgress />)
                    } else if(!workspace) {
                        return (<Workspaces/>)
                    } else {
                        console.log("Workspace is loaded", loading, widList, wid, workspace)
                        return (props.children)
                    }
                })()}            
        </WorkspaceContext.Provider>
    )
}