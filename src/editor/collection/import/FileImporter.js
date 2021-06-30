import { makeStyles } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import { useSnackbar } from "notistack";
import { useCallback, useMemo, useState } from "react";
import { buildRegistry, processChunk } from "./importer";
import firebase from "firebase/app";
import { storage } from "../../../firebase/config";
import { useStorage } from "../../../firebase/useStorage";
import { useEditor } from "../../useEditor";
import { useWorkspace } from "../../../components/workspace/useWorkspace";

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

export const FileImporter = ({ importer: {id, config}, onAbort}) => {
  const classes = useStyles();
  const {enqueueSnackbar} = useSnackbar()
  const {addObject} = useStorage()
  const [progress, setProgress] = useState()  
  const [result, setResult] = useState()  
  const {tenantId, wid, uid} = useWorkspace()
  const {collectionId} = useEditor()

  // const onDrop = useCallback((acceptedFiles) => {
  //   acceptedFiles.forEach((file) => {
  //     const reader = new FileReader();

  //     reader.onabort = () => enqueueSnackbar("file reading was aborted");
  //     reader.onerror = () => enqueueSnackbar("file reading has failed");
  //     reader.onload = async (e) => {

  //       // // e.target.result
  //       const fileContent = reader.result;
  //       // // console.log(fileContent);
  //       // // enqueueSnackbar(fileContent)
  //       const register = buildRegistry(config.mapping)

  //       consumeCsv(id, config, collectionId, fileContent, register, setProgress, setResult, addObject)
        
  //     };
  //     reader.readAsText(file, config.config.encoding)
  //   });
  // }, []);

  const onDrop = useCallback((acceptedFiles, fileRejections, event) => {
    console.log(`onDrop  ${acceptedFiles.length} acceptedFiles, ${fileRejections.length} fileRejections` )
    // Create a root reference
  var storageRef = storage.ref();

  // Create a reference to 'mountains.jpg'
  var importRef = storageRef.child("imports");

    acceptedFiles.forEach((file) => {

      const metadata = {

        customMetadata: { tenantId, wid, uid, id}
      }
      console.log("Send metadata", metadata)
      var uploadTask = importRef.child(`${tenantId}/${wid}/${id}/${file.name}`).put(file, metadata)

      uploadTask.on('state_changed',  (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        // Handle unsuccessful uploads
        console.log('Uploaded a failed!', error);
      }, 
      () => {
        // Handle successful uploads on complete
        console.log('Uploaded a blob or file!!!');

        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        // uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        //   console.log('File available at', downloadURL);
        // });
      })
      

      uploadTask.then((snapshot) => {
        console.log('Uploaded a blob or file!');
      });
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, maxFiles:1, accept: config.extentions});

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
        Use importer: {config.name || "(unnamed)"} - {config.type}
      </p>
      {config.type === "CSV" && (<CsvType config={config} />)} 
      
      <p>progress: {progress}</p>
      <p>result: imported: {result?.imported}, failed: {result?.failed}, lines: {result?.lines}</p>


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


const CsvType = ({config}) => {

  return (
    <ul>
      <li>
        <strong>Expected headers</strong> {config.config.columns.join(" ")}
      </li>
      <li>
        <strong>Expected separator</strong> {config.config.separator}
      </li>
  </ul>
  )
}

const consumeCsv = async (id, config, collectionId, fileContent, register, setProgress, setResult, addObject) => {

  var lines = fileContent.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
  if(lines.length > 0 && lines[0].startsWith(config.config.columns[0])){
    lines.shift()
  }

  var imported = 0
  var failed = 0
  lines.forEach((line, index) => {
    try{
      console.log("Row ", line)
      const payload = processChunk(line, config.type, config.config, register)
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

        const result = addObject(collectionId, objectId, attributesToSave)
        console.log("Saved ", result)
        setProgress(++imported)
      } catch(error) {
        failed++
        console.log("Failed (",failed,") to import row ", index+1, "line:", line, "cause:", error)
      }
  }); 

  setResult({imported, failed, lines: lines.length})

}