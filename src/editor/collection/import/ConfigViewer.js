import { makeStyles } from "@material-ui/core"
import { useWorkspace } from "../../../components/workspace/useWorkspace"
import MapData from "../../../imports/mapper/MapData"

const useStyles = makeStyles(() => ({
    
}))
const ConfigViewer = ({importer:{config}, onAbort}) => {
    return (
        <>
            <a onClick={onAbort}>Back to list</a>
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