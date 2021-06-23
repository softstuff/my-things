import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles(() => ({
    
}))
const ConfigEditor = ({config, onAbort}) => {

    const classes = useStyles()

    return (
        <>
            <a onClick={onAbort}>Back to list</a>
            <p>Import {config.name || '(unnamed)'} - {config.type}</p>

        </>
    )
}

export default ConfigEditor