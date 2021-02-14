import React, {useState} from 'react'
import { Button, makeStyles } from '@material-ui/core'
import ImportConfigEditor from '../imports/ImportConfigEditor'
import ImportWizard from '../imports/ImportWizard'

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


  return (
    <main className={classes.container}>

show:{show}
      { (()=>{
        if(show === 'create') {
          return <CreateImport onAbort={()=>setShow('list')} onCreated={(config)=>setShow(config)} />
        } else if (show === 'list') {
          return <ConfigurationList onCreateNew={()=>setShow('create')} />
        } else {
          return (<div>
            <ImportPageHeader onBackToList={()=>setShow('list')} />
            <ImportConfigEditor config={show}/>
          </div>)
        }
      })()}
    </main>)
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
      <ImportWizard />
    </div>)
}

export default ImportPage
