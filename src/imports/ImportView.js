import React, { useState } from "react"
import { Fab, makeStyles } from "@material-ui/core"
import AddIcon from '@material-ui/icons/Add';
import ImportCreator from "./wizzard/ImportCreator"
import ImportList from "./ImportList"
import ConfigEditor from "./ConfigEditor";
import ConfigViewer from "./ConfigViewer";
import { FileImporter } from "./FileImporter";

const useStyles = makeStyles((theme) => ({
    fab: {
        position: 'absolute',
        right: theme.spacing(8),
        bottom: theme.spacing(8)
    }
}))

const ImportView = ({editing = true}) => {
    const classes = useStyles()
    
    const [selected, setSelected] = useState()
    const [create, setCreate] = useState()
    const [view, setView] = useState()
    const [edit, setEdit] = useState()
    const [inUse, setInUse] = useState()


    const handleOnCreated = importer => {
        setCreate(false)
        setInUse(importer)
    }

    if (create) {
        return (<ImportCreator onAbort={()=>setCreate(false)} onCreated={handleOnCreated} />)
    }
    if (inUse) {
        return (<FileImporter importer={inUse} onAbort={()=>setInUse()}/>)
    }
    if (view) {
        return (<ConfigViewer importer={view} onAbort={()=>setView()}/>)
    }
    if (edit) {
        return (<ConfigEditor importer={edit} onAbort={()=>setEdit()}/>)
    }
    if (selected) {
        if(editing) {
            return (<ConfigEditor importer={selected} onAbort={()=>setSelected()}/>)
        } else {
            return (<ConfigViewer importer={selected} onAbort={()=>setSelected()}/>)
        }
    }
    

    return (
        <>
            <ImportList editing={editing} onSelect={setSelected} onEdit={setEdit} onView={setView} onUse={setInUse} />

            {editing && (
            <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>setCreate(true)}>
                <AddIcon/>
            </Fab>
            )}
        </>
    )
}

export default ImportView