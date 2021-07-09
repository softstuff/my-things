import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles(() => ({
    
}))
const ConfigEditor = ({importer, onAbort}) => {

    const classes = useStyles()

    return (
        <>
            <a onClick={onAbort}>Back to list</a>
            <p>Import {importer.config.name || '(unnamed)'} - {importer.config.type}</p>

            <p>ID:{importer.id}</p>
        </>
    )
}

export default ConfigEditor