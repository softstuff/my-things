import { Button } from "@material-ui/core"
import MapData from "../../../imports/mapper/MapData"

const ConfigViewer = ({importer:{config}, onAbort}) => {
    return (
        <>
            <Button onClick={onAbort}>Back to list</Button>
            <p>Import: {config.name || '(unnamed)'} - {config.type}</p>
           {config.type === "CSV" && (<CsvViewer config={config} />)} 
            

            <MapData
              initElements={config.mapping.elements}
              locked={true}
            />
        </>
    )
}

const CsvViewer = ({config}) => {

    return (
        <ul>
            <li><strong>Expected headers</strong> {config.config.columns.join(" ")}</li>
            <li><strong>Expected separator</strong> {config.config.separator}</li>
        </ul>
    )
}

export default ConfigViewer