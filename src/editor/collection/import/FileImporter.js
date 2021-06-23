import { makeStyles } from "@material-ui/core";
import MapData from "../../../imports/mapper/MapData";
import { useDropzone } from "react-dropzone";
import { useSnackbar } from "notistack";
import { useCallback, useMemo } from "react";
import { buildRegistry, processChunk } from "./importer";
import { useStorage } from "../../../firebase/useStorage";
import { useEditor } from "../../useEditor";
const useStyles = makeStyles(() => ({}));


const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

export const FileImporter = ({ config: { name, type, config, mapping }, onAbort}) => {
  const classes = useStyles();
  const {enqueueSnackbar} = useSnackbar()
  const {addObject} = useStorage()
  // const [register, setRegister] = useState()  
  const {collectionId} = useEditor()

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => enqueueSnackbar("file reading was aborted");
      reader.onerror = () => enqueueSnackbar("file reading has failed");
      reader.onload = async (e) => {

        // e.target.result
        const text = reader.result;
        console.log(text);
        enqueueSnackbar(text)
        const register = buildRegistry(mapping)

        var lines = text.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
        if(lines.length > 0 && lines[0].startsWith(mapping.inputs[0])){
          lines.shift()
        }
        lines.forEach(async (line) => {
            console.log("Row ", line)
            const payload = processChunk(line, type, config, register)
            console.log("Got payload",payload)
            
            const objectId = undefined
            const attributesToSave = Object.keys(payload)
              .filter(name => name.startsWith("out_"))
              .reduce((map, nodeId)=>{
                const attributeName = register.nodeIdToNode[nodeId].data.label
                const value = payload[nodeId]
                map[attributeName] = value
                return map
              }, {})

              console.log("attributesToSave", attributesToSave)

              const result = await addObject(collectionId, objectId, attributesToSave)
              console.log("Saved ", result)

        }); 
        
      };
      // reader.readAsArrayBuffer(file);
      reader.readAsText(file)
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, maxFiles:1, accept: '.csv'});

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  return (
    <>
      <a onClick={onAbort}>Back to list</a>
      <p>
        Use importer: {name || "(unnamed)"} - {type}
      </p>
      <ul>
        <li>
          <strong>Expected headers</strong> {config.columns.join(" ")}
        </li>
        <li>
          <strong>Expected delimiter</strong> {config.delimiter}
        </li>
      </ul>

      <div className="container">
        <div {...getRootProps({style})}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
      </div>
    </>
  );
};
