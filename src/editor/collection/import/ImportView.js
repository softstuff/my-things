import React, { useState } from "react"
import { Fab, makeStyles } from "@material-ui/core"
import AddIcon from '@material-ui/icons/Add';
import ImportCreator from "./wizzard/ImportCreator"
import ImportEditor from "./ConfigEditor"
import ImportList from "./ImportList"
import { useEditor } from "../../useEditor";
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

const ImportView = () => {
    const classes = useStyles()
    const {editing} = useEditor()
    
    const [selected, setSelected] = useState()
    const [creating, setCreating] = useState()
    const [inUse, setInUse] = useState()

    const openImporter = config => {
        setInUse(config)
    }
    if (creating) {
        return (<ImportCreator onAbort={()=>setCreating(false)} />)
    }
    if (selected) {
        if(editing) {
            return (<ConfigEditor config={selected} onAbort={()=>setSelected()}/>)
        } else {
            return (<ConfigViewer config={selected} onAbort={()=>setSelected()}/>)
        }
    }
    if (inUse) {
        return (<FileImporter config={inUse} onAbort={()=>setSelected()}/>)
    }

    return (
        <>
            <ImportList onSelect={setSelected} onUse={openImporter} />

            {editing && (
            <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>setCreating(true)}>
                <AddIcon/>
            </Fab>
            )}
        </>
    )
}

export default ImportView