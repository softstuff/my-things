import {
  Card,
  CardContent,
  Radio,
  FormControlLabel,
  makeStyles,
  Typography,
  RadioGroup,
  TextField,
  FormGroup, Button, Paper, CardActions
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

import {useCallback, useEffect, useMemo, useState} from "react";
import { useWorkspace } from "../../components/workspace/useWorkspace";
import { useWizzard } from "./useWizzard";
import {storage} from "../../firebase/config";
import firebase from "firebase";
import {useDropzone} from "react-dropzone";

const useStyles = makeStyles(() => ({
  container: {
    width: '30rem',
    height: '100px',
  },
  row: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "1rem",
  },
  encoding: {
    width: "30rem",
  },
  sample: {
    marginTop: "5rem",
  },
}))

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
  transition: 'border .24s ease-in-out',
  height: '100%',
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


const selectableEncodings = [
  { encoding: "UTF-8", used: "Default" },

  { encoding: "windows-1250", used: "Czech, Hungarian, Polish, Romanian" },
  { encoding: "windows-1251", used: "Russian" },
  {
    encoding: "windows-1252",
    used: "Danish, Dutch, English, French, German, Italian, Norwegian, Portuguese, Swedish",
  },
  { encoding: "windows-1253", used: "Greek" },
  { encoding: "windows-1254", used: "Turkish" },
  { encoding: "windows-1255", used: "Hebrew" },
  { encoding: "windows-1256", used: "Arabic" },


  {
    encoding: "ISO-8859-1",
    used: "Danish, Dutch, English, French, German, Italian, Norwegian, Portuguese, Swedish",
  },
  { encoding: "ISO-8859-2", used: "Czech, Hungarian, Polish, Romanian" },
  { encoding: "ISO-8859-5", used: "Russian" },
  { encoding: "ISO-8859-6", used: "Arabic" },
  { encoding: "ISO-8859-7", used: "Greek" },
  { encoding: "ISO-8859-8", used: "Hebrew" },
  { encoding: "ISO-8859-9", used: "Turkish" },

  { encoding: "KOI8-R", used: "Russian" },
  { encoding: "IBM420", used: "Arabic" },
  { encoding: "IBM424", used: "Hebrew" },

  { encoding: "Shift_JIS", used: "Japanese" },
  { encoding: "ISO-2022-JP", used: "Japanese" },
  { encoding: "ISO-2022-CN", used: "Simplified Chinese" },
  { encoding: "ISO-2022-KR", used: "Korean" },
  { encoding: "GB18030", used: "Chinese" },
  { encoding: "Big5", used: "Traditional Chinese" },
  { encoding: "EUC-JP", used: "Japanese" },
  { encoding: "EUC-KR", used: "Korean" },

  { encoding: "UTF-16BE" },
  { encoding: "UTF-16LE" },
  { encoding: "UTF-32BE" },
  { encoding: "UTF-32LE" },
];

export function FilePanel() {
  const classes = useStyles()
  const {state, dispatch} = useWizzard()
  const {workspace} = useWorkspace()
  const [error, setError] = useState()
  const [file, setFile] = useState(state?.file?.file)
  const [sample, setSample] = useState()
  const [encoding, setEncoding] = useState(state?.file?.encoding  || "UTF-8")

  const onDrop = useCallback((acceptedFiles, fileRejections, event) => {
    console.log(`onDrop  ${acceptedFiles.length} acceptedFiles, ${fileRejections.length} fileRejections` )

    setError( fileRejections?.map(rejected => rejected.errors.map(error=>error.message).join(',')).join(',') )

    if(acceptedFiles.length === 1) {
      setFile( acceptedFiles[0])

    }

  }, [encoding]);

  useEffect(()=>{
    if(!file || !encoding){
      return
    }
    console.log("got a file and encoding", file, encoding)
    const chunkBlob = file.slice(0, 200)

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      const result = event.target.result;
      setSample(result)
      console.log("File content", result)
      dispatch({type: "SET_FILE", payload: {sample: result, encoding, file, extentions: [".csv", ".txt"]}})
    });

    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Progress: ${Math.round(percent)}`);
      }
    });
    reader.readAsText(chunkBlob, encoding);
  },[file, encoding])


  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, accept: ['text/csv']});

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

  const handleChangeEncoding = (e, newValue) => {
    const _encoding = newValue?.encoding || "UTF-8";
    console.log("handleChangeEncoding", _encoding)
    setEncoding(_encoding)
    // const values = { ...state.config, encoding };
    // dispatch({ type: "SET_CONFIG", values, isValid: state.config.columns.length > 0 });
  };

  // useEffect(()=>{
  //   dispatch({type: "SET_TYPE", value: state.type, isValid: state.type !== null})
  // },[dispatch, state.type])

  // const handleChangeType = event => {
  //   console.log("handleChangeType ", event.target.name, event.target.value, event.target.checked)
  //   const newType = event.target.value
  //   dispatch({type: "SET_TYPE", value: newType, isValid: state.type !== null})
  // }

  // const handleStructureSelect = name => {
  //   const create = !workspace.collections.includes(name)
  //   let properties = []
  //   if (create && state.type === "CSV") {
  //     properties = state.config.columns.map( name => ({ name, type:"text" }))
  //   }
  //
  //   dispatch({type: "SET_STRUCTURE", payload: {name, create, properties}})
  // }

  return (
    <>

      <div>
        <Card >
          <CardContent  className={classes.row}>
          <div className={classes.container}>
            <div {...getRootProps({style})}>
              <input {...getInputProps()} />
              {isDragActive ? (
                  <p>Drop the files here ...</p>
              ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
          </div>

            <div>encoding: {encoding}</div>
          <FormGroup className={classes.encoding}>
            <Autocomplete
                id="encoding"
                disableClearable={true}
                value={encoding}
                onChange={handleChangeEncoding}
                // style={{ maxwidth: 300 }}
                options={selectableEncodings}
                getOptionLabel={(option) => option.encoding || option}
                getOptionSelected={(option, value)=> option.encoding === value?.encoding || value}
                renderOption={(option) => (
                    <>
                      <span>{option.encoding}</span>
                      {option.used && (<span>- {option.used}</span>)}
                    </>
                )}
                renderInput={(params) => <TextField {...params} label="File encoding" variant="outlined" margin="normal" /> }
            />
          </FormGroup>
            </CardContent>


        {error && (<div>File was rejected: {error}</div>)}
        {file && (<>
        </>)}

        {sample && (
              <CardContent className={classes.sample} >
                <Typography variant="h4" gutterBottom>
                  File sample.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Is the text look ok for you?
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Otherwise change the encoding.
                </Typography>
                <pre>{sample}</pre>
              </CardContent>
        )}
        </Card>
      </div>
    </>
  );
}

