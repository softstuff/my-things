import { Button } from "@mui/material"

const ConfigEditor = ({importer, onAbort}) => {

    return (
        <>
            <Button onClick={onAbort}>Back to list</Button>
            <p>Import {importer.name || '(unnamed)'} - {importer.type}</p>

            <p>ID:{importer.id}</p>
        </>
    )
}

export default ConfigEditor