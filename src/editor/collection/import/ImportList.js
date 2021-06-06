import {List, ListItem, ListItemIcon, ListItemText, makeStyles } from "@material-ui/core"
import DeleteIcon from '@material-ui/icons/Delete';

import { useEffect, useState } from "react";
import { useWorkspace } from "../../../components/workspace/useWorkspace"
import { useEditor } from "../../useEditor";
import { useStorage } from "../../../firebase/useStorage";

const useStyles = makeStyles((theme) => ({
    nameItem: {
        flexGrow: 1
    }
}))

const ImportList = ({onSelect}) => {
    const classes = useStyles()
    const {workspace} = useWorkspace()
    const {collectionId, editing} = useEditor()
    const {deleteWorkspaceField} = useStorage()
    const [names, setNames] = useState([])
    const [imports, setImports] = useState()

    useEffect(()=>{
        if (!workspace || !collectionId){
            return
        }
        const imp = (workspace.imports || {})[collectionId]
        if( imp ) {
            const names = Object.keys(imp)
            setNames(names)
            setImports(imp)
        } else {
            setNames([])
            setImports()          
        }
    }, [workspace, collectionId])

    const deleteImport = async (name) => {
        console.log("Delete import named ", name)
        await deleteWorkspaceField(`imports.${collectionId}.${name}`)
        console.log("Deleted")
    }

    return (
        <>            
            {names.length === 0 && (<p>No imports has been created, yet..</p>)}

            <List>
            {names.map((name, index) => (
                <ListItem key={index} onClick={()=>onSelect(name)}>
                    <ListItemText className={classes.nameItem} >name: {name}</ListItemText>
                    <ListItemText primary={imports[name].type} className={classes.typeItem} />
                    <ListItemText primary={imports[name].lastRun} className={classes.typeItem} />
                    <ListItemText primary={imports[name].lastStatus} className={classes.typeItem} />
                    {editing && (
                    <ListItemIcon onClick={()=>deleteImport(name)}>
                        <DeleteIcon />
                    </ListItemIcon>
                    )}
                </ListItem>
            ))}
            </List>
            abc
        </>)
}

export default ImportList