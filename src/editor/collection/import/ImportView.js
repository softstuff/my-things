import React, { useState } from "react"
import { Fab, makeStyles } from "@material-ui/core"
import AddIcon from '@material-ui/icons/Add';
import ImportCreator from "./wizzard/ImportCreator"
import ImportEditor from "./ImportEditor"
import ImportList from "./ImportList"
import { useEditor } from "../../useEditor";

const useStyles = makeStyles((theme) => ({
    fab: {
        position: 'absolute',
        right: theme.spacing(8),
        bottom: theme.spacing(8)
    }
}))

const ImportView = () => {
    const classes = useStyles()
    const {collectionId, editing} = useEditor()
    
    const [selected, setSelected] = useState()
    const [creating, setCreating] = useState()

    if (creating) {
        return (<ImportCreator onAbort={()=>setCreating(false)} />)
    }
    if (selected) {
        return (<ImportEditor name={selected} onAbort={()=>setSelected()}/>)
    }

    return (
        <>
            <ImportList onSelect={setSelected} />

            {editing && (
            <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>setCreating(true)}>
                <AddIcon/>
            </Fab>
            )}
        </>
    )
}

export default ImportView