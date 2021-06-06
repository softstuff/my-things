import React, {useState} from 'react'
import {Button, makeStyles} from '@material-ui/core'
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


  // const inputs=[{id: '1', name: 'förnamn'}, {id: '2', name: 'efternamn'}, {id: '3', name: 'age'}]
  // const outputs=[{id: '100', key: 'yes', name: 'Namn'}, {id: '101', required: 'yes', name: 'Ålder'}, {id: '102', name: 'Kön'}]
  // const actions=[{
  //   id: '50',
  //   type: 'join',
  //   data: { joiner: "XX"},
  //   position: { x: 250, y: 75 }
  // }]
  // const edges=[{source: '1', target: '50', targetHandle: 'a'},
  //  {source: '2', target: '50', targetHandle: 'b'},  {source: '50', target: '100'},
  //  {source: '3', target: '101'}]
  //  <MapData 
  //  inputs={inputs}
  //  outputs={outputs}
  //  actions={actions}
  //  edges={edges} />