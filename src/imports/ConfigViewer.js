import { Button } from "@mui/material"
import MapData from "./mapper/MapData"

const ConfigViewer = ({importer, onAbort}) => {
    return (
        <>
            <Button onClick={onAbort}>Back to list</Button>
            <p>Import: {importer.name || '(unnamed)'} - {importer.type}</p>
           {importer.type === "CSV" && (<CsvViewer importer={importer} />)}
            

            <MapData
              initElements={importer.mapping.elements}
              locked={true}
            />
        </>
    )
}

const CsvViewer = ({importer}) => {

    return (
        <ul>
            <li><strong>Expected headers</strong> {importer.config.columns.join(" ")}</li>
            <li><strong>Expected separator</strong> {importer.config.separator}</li>
        </ul>
    )
}

export default ConfigViewer