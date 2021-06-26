import {List, ListItem, ListItemIcon, ListItemText, makeStyles, Button } from "@material-ui/core"
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

const ImportList = ({onSelect, onUse}) => {
    const classes = useStyles()
    const {workspace} = useWorkspace()
    const {collectionId, editing} = useEditor()
    const {deleteWorkspaceField} = useStorage()
    const [imports, setImports] = useState([])

    useEffect(()=>{
        setImports(Object.keys(workspace.imports || [])
                        .filter(id => workspace.imports[id].collectionId === collectionId)
                        .map(id => ({ id, config: workspace.imports[id] }))
                        || [])
    }, [workspace, collectionId])

    const deleteImport = async (name) => {
        // console.log("Delete import named ", name)
        // await deleteWorkspaceField(`imports.${collectionId}.${name}`)
        // console.log("Deleted")
    }

    const openImporter = importer => {
        onUse(importer)
    }

    return (
        <>            
            {imports.length === 0 && (<p>No imports has been created, yet..</p>)}

            <List>
            {imports.map( importer => (
                <ListItem key={importer.id} >
                    <ListItemText className={classes.nameItem} >{importer.config.name}</ListItemText>
                    <ListItemText primary={importer.config.type} className={classes.typeItem} />
                    <ListItemText primary={importer.config.lastRun || 'never'} className={classes.typeItem} />
                    <ListItemText primary={importer.config.lastStatus || '-'} className={classes.typeItem} />
                    <ListItemText className={classes.typeItem} >
                        <Button variant="contained" color="primary" onClick={()=>onSelect(importer)}>View</Button>
                    </ListItemText>
                    <ListItemText className={classes.typeItem} >
                        <Button variant="contained" color="primary" onClick={()=>openImporter(importer)}>Use</Button>
                    </ListItemText>

                    {editing && (
                    <ListItemIcon onClick={()=>deleteImport(importer.id)}>
                        <DeleteIcon />
                    </ListItemIcon>
                    )}
                </ListItem>
            ))}
            </List>
        </>)
}

export default ImportList