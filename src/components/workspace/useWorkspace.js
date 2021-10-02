//@flow
import { CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, {createContext, useContext, useEffect, useState} from 'react'
import {getWorkspaceIdList, loadWorkspace} from '../../firebase/storage'
import Workspaces from '../../pages/Workspaces'
import {useUser} from '../user/useUser'

const useStyles = makeStyles(() => ({

centerScreen: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    minHeight: "100vh"
  }
}))

export const WorkspaceContext = createContext()

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext)
    return { ...context}
}

export const WorkspaceProvider = (props) => {

    const [loading, setLoading] = useState(true)
    const [workspace, setWorkspace] = useState()
    const [schema] = useState()
    const [wid, setWid] = useState()
    const [widList, setWidList] = useState([])
    const { tenantId, uid } = useUser()
    const classes = useStyles()


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
        let mounted = true
        setLoading(true)
        loadWorkspace(tenantId, wid,
            loaded => {
                if(mounted) {
                    setWorkspace(loaded)
                    setLoading(false)
                    console.log('Loaded workspace', wid, loaded)
                }
            },
            error => {
                console.log(`Failed to load workspace ${wid}`, error)
            })
        return () => {
            mounted = false
            console.log("Unsubscribe from workspace ", wid)
        }
    }, [tenantId, wid])

    return (
        <WorkspaceContext.Provider value={{wid, workspace, setWid, widList, schema, tenantId, uid}} >
             { (()=>{
                    if(loading){
                        return (<div className={classes.centerScreen}><CircularProgress/></div>)
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