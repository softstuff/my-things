import { makeStyles } from "@material-ui/core"
import MapData from "../../../imports/mapper/MapData"

const useStyles = makeStyles(() => ({
    
}))
const ConfigViewer = ({config:{name, type, config, mapping}, onAbort}) => {

    const classes = useStyles()

    return (
        <>
            <a onClick={onAbort}>Back to list</a>
            <p>Import: {name || '(unnamed)'} - {type}</p>
            <ul>
                <li><strong>Expected headers</strong> {config.columns.join(" ")}</li>
                <li><strong>Expected delimiter</strong> {config.delimiter}</li>
            </ul>
            

            <MapData
              initElements={mapping.elements}
              locked={true}
            />
        </>
    )
}

export default ConfigViewer