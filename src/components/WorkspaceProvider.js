//@flow
import { CircularProgress } from '@material-ui/core'
import React, { useEffect, useState, useContext } from 'react'
import { getWorkspaces } from '../firebase/storage'
import { useSession } from '../firebase/UserProvider'
import Workspaces from '../pages/Workspaces'

const WorkspaceContext = React.createContext()

export const useWorkspace = () => {
    return useContext(WorkspaceContext)
}

export const WorkspaceProvider = (props) => {

    const [loading, setLoading] = useState(true)
    const [workspace, setWorkspace] = useState()
    const { claims } = useSession()

   

    useEffect(()=>{

        if(!claims) {
            return null
        }
        
        const onLoaded = (workspaces) => {
            if(workspaces.length === 1) {
                console.log("use the only workspace", workspaces[0].id)
                setWorkspace(workspaces[0])
            }
            setLoading(false)
        }

        const onError = (error) => {
            console.log(`Failed to load workspaces`, error)
            setLoading(false)
        }
        return getWorkspaces(claims.myThings.tenantId, onLoaded, onError)
    },[claims])

    if(!claims) {
        return null
    }

    return (
        <WorkspaceContext.Provider value={{workspace, setWorkspace}} >
             { (()=>{
                    if(loading){
                        return (<CircularProgress />)
                    } else if(!workspace) {
                        return (<Workspaces/>)
                    } else {
                        return (props.children)
                    }
                })()}            
        </WorkspaceContext.Provider>
    )
}