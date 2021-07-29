import React, {useState} from 'react'
import {Button, makeStyles} from '@material-ui/core'
import ImportView from "../imports/ImportView";


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap'
    }
}));

const ImportPage = () => {
  const [show, setShow] = useState('list')
  const classes = useStyles()


  return <ImportView />
}

const ConfigurationList = ({onCreateNew}) => {
  return (
    <div>
      <Button onClick={onCreateNew}>Create new</Button>

      <p>No configurations created yet</p>
    </div>)
}

const ImportPageHeader = ({onBackToList}) => {
  return (
    <div>
      <Button onClick={onBackToList}>Back to list</Button>

    </div>)
}

const CreateImport = ({onAbort, onCreated}) => {

  return (
    <div>
      <p>Create import</p>    
    </div>)
}

export default ImportPage
