import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { database, storage } from "../firebase/config";
import firebase from 'firebase/app'
import { useWorkspace } from "../components/workspace/useWorkspace";
import { Button } from "@mui/material";


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

export const FileImporter = ({ importer, onAbort}) => {
  const [result, setResult] = useState()  
  const {tenantId, wid, uid} = useWorkspace()
  const [batchId] = useState(Number(new Date()))
  const importBatchRef = useRef()


  useEffect(()=>{
    console.log("batchId changed to ", batchId)
    if(batchId){
      console.log("Connect to ", `${tenantId}/${wid}/imports/${importer.id}/${batchId}`)
      const impRef = database.ref(`${tenantId}/${wid}/imports/${importer.id}/${batchId}`)
      importBatchRef.current = impRef
      impRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log("value changed ", data)
        setResult(data)
      })
    }

  },[tenantId,wid, importer.id, batchId])

  const onDrop = useCallback((acceptedFiles, fileRejections, event) => {
    console.log(`onDrop  ${acceptedFiles.length} acceptedFiles, ${fileRejections.length} fileRejections` )
  
  let storageRef = storage.ref();
  let importRef = storageRef.child("imports");

    acceptedFiles.forEach((file) => {

      const metadata = {

        customMetadata: { tenantId, wid, uid, iid: importer.id, batchId}
      }
      console.log("Send metadata", metadata)
      
      let uploadTask = importRef.child(`${tenantId}/${wid}/${importer.id}/${file.name}`).put(file, metadata)

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,  (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var _progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + _progress + '% done, State:', snapshot.state)
      }, 
      (error) => {
        // Handle unsuccessful uploads
        console.log('Uploaded a failed!', error);
      }, 
      () => {
        // Handle successful uploads on complete
        console.log('Uploaded a blob or file!!!');
      })
      

      uploadTask.then((snapshot) => {
        console.log('Uploaded a blob or file!');
      });
    });
  }, [batchId, importer.id, tenantId, uid, wid]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, accept: importer.config.extentions});

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

  const decodeKey = key => {
    return key.replace("_dot_", ".")
  }

  const asDate = firebaseTimestamp => {
    console.log("As date", firebaseTimestamp)
    return new Date(firebaseTimestamp).toISOString()
  }

  return (
    <>
      <Button onClick={onAbort}>Back to list</Button>
      <p>
        Use importer: {importer.name || "(unnamed)"} - importer.type}
      </p>
      {importer.type === "CSV" && (<CsvType config={importer.config} />)}
          
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


      {result && (
        <div>
          <div>Result</div>
          <div>Started: {asDate(result?.startedAt)}</div>
          <div>Imported: {result?.imported}</div>
          <div>Failed: {result?.failed}</div>
          {result.files && (<div>
            Files:
            <ul>
              {Object.keys(result.files).map((fileName, index)=>(
                <li key={index}>
                  <div><strong>{decodeKey(fileName)}</strong></div>
                  <div>Started: {asDate(result?.startedAt)}</div>
                  {result.files[fileName].endedAt ? (<div>EndedAt: {result.files[fileName].endedAt}</div>) : <div>Inprogress</div>}
                  <div>Imported: {result.files[fileName].imported}</div>
                  <div>Failed: {result.files[fileName].failed}</div>
                  
                  <div>timeMs: {result.files[fileName].timeMs}</div>
                  <div>ratePerSec: {result.files[fileName].ratePerSec}</div>
                </li>
              ))}
            </ul>
            </div>)}
        </div>
      )}
    </>
  );
};


const CsvType = ({config}) => {

  return (
    <ul>
      <li>
        <strong>Expected headers</strong> {config.columns.join(" ")}
      </li>
      <li>
        <strong>Expected separator</strong> {config.separator}
      </li>
  </ul>
  )
}