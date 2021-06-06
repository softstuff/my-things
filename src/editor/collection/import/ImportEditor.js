import { makeStyles } from "@material-ui/core"
import { useEffect, useState } from "react"
import { useWorkspace } from "../../../components/workspace/useWorkspace"
import { useStorage } from "../../../firebase/useStorage"
import { useEditor } from "../../useEditor"

const useStyles = makeStyles(() => ({
    
}))
const ImportEditor = ({name, onAbort}) => {

    const classes = useStyles()
    const {workspace} = useWorkspace()
    const {collectionId, editing} = useEditor()
    const [savedConfig, setSavedConfig] = useState()
    const [wipConfig, setWipConfig] = useState()
    const {} = useStorage()

    useEffect(()=>{
        const saved = workspace.imports[collectionId][name]
        setSavedConfig(saved)
        setWipConfig({...saved})
    }, [name, collectionId, workspace])

    return (
        <>
            <a onClick={onAbort}>Back to list</a>
            <p>Import {name}</p>

        </>
    )
}

export default ImportEditor