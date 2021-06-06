import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from '@material-ui/core';
import Ajv from "ajv"
import MapData from './MapData';
import {ImportConfigContext, useImportConfig} from './useImportConfig';
import {useSchema} from '../schema/useSchema';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));


function getSteps() {
  return ['Set input data', 'Set target', 'Map input to schema'];
}

function getStepContent(step, onValidation) {
  switch (step) {
    case 0:
      return <DataStructure onValidation={onValidation} myStep={0}/>
    case 1:
      return <SetCollection onValidation={onValidation} myStep={1}/>
    case 2:
      return <MapFields onValidation={onValidation} myStep={2}/>
    default:
      return 'Unknown step';
  }
}

export default function  ImportWizard({}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(0);
  const [config, setConfig] = useState({});
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleStepValidation = (valid) => setIsStepValid(valid)

  return (
    <div className={classes.root}>
      <ImportConfigContext.Provider value={{config, setConfig, activeStep}} >
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <div>
                  {getStepContent(index, handleStepValidation)}
                </div>
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.button}
                      disabled={!isStepValid}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </ImportConfigContext.Provider>
    </div>
  );
}

const devDataSample = `Förnamn;Efternamn;Ålder;Kön
Foo;Bar;42;K
Kalle;Kula;33;M`
const DataStructure = ({onValidation, myStep}) => {
  const [guess, setGuess] = useState()
  const [data, setData] = useState(devDataSample)
  const {config, setConfig, activeStep} = useImportConfig()

  const handleGuessStructure = (e) => {
    const sample = e.target.value
    setData(sample)
    const _guess = guessStructure(sample)
    setGuess( _guess )
    onValidation(_guess.valid)
  }

  useEffect(()=>{
    console.log("Data structure activeStep: ", activeStep, myStep, guess, config)
    if( myStep !== activeStep) {
      const updatedConfig = {...config, structure: guess, testData: data}
      setConfig(updatedConfig)
      console.log("Saved data structure", updatedConfig)
    }
  },[activeStep])

  useEffect(()=>{
    const _guess = guessStructure(devDataSample)
    setGuess( _guess )
    onValidation(_guess.valid)
  },[])
  

  return (
    <div>
        <TextField name='sample' multiline={true} rows={20} style={{width:'50rem'}} placeholder='Add a part of the data sample'
        value={data}
        onChange={handleGuessStructure} />

        {guess && (<>
          <p>Guess is: {guess.text}</p>
          <p>Content is: {guess.valid ? 'valid' : 'not valid'}</p>
          {guess.delimiter && <p>delimiter is {guess.delimiter}</p>}
          {guess.error && <p>Error: {guess.error}</p>}
        </>)}

    </div>
  )
}

const guessStructure = (sample) => {

  const firstRow = getFirstLine(sample)
  let guess = {
    text: "No idea"
  }
  

  if (firstRow) {
    if(firstRow.includes('{')) {
      guess.json=true
      guess.jsonSchema = sample.includes('$schema')
      guess.text = `My guess is that this is a JSON ${ guess.jsonSchema ? 'schema ' : ''} file`
      try {
          const json = JSON.parse(sample);
          if (guess.jsonSchema){
            validateJsonSchema(json)
          }
          guess.valid = true
      } catch (e) {
        guess.error = e.message || e
        guess.valid = false;
      }

    } else if (firstRow.match(/[,|;|/t]/)) { 
      guess.delimiter = firstRow.match(/[,|;|/t]/)[0]
      guess.columns = firstRow.split(guess.delimiter)
      guess.text = `My guess is that this is a CSV file with delimiter ${guess.delimiter} with ${guess.columns.length} columns`
      guess.valid = true
      guess.csv = true
      
    }
  }

  
  console.log('Guess is', guess)
  return guess

}

function validateJsonSchema(json) {
    const ajv = new Ajv()
    ajv.addKeyword("order")
    ajv.compile(json)
}

const getFirstLine = (sample) => {
  // skipp comments by // or # , with or without whitespaces before
  const first = sample.split("\n").find( row => row.trimStart().match(/^(?![#|\/]).*$/g))
  return first
}


const SetCollection = ({onValidation, myStep}) => {
  const { schema, getPointerFor, collectionIdFor} = useSchema()
  const [selected, setSelected] = useState("")
  const {config, setConfig, activeStep} = useImportConfig()

  useEffect(()=>{
    console.log("collection path step activeStep: ", activeStep, myStep, selected, config)
    onValidation(selected !== "")
    if( myStep !== activeStep) {
      
      const pointer = getPointerFor(selected)
      const collectionId = collectionIdFor(pointer)
      const updatedConfig = {...config, collectionPath: selected, pointer, collectionId}
      setConfig(updatedConfig)
      console.log("Saved collection path", updatedConfig, config)
    }
  },[activeStep, getPointerFor])

  const handleChange = (event) => {
    setSelected(event.target.value);
    onValidation(true)
  };

  const renderSchemaRoot = (schema) => {
    return (<ul>
      {Reflect.ownKeys(schema.properties).map(collection => {
        if(schema.properties[collection]?.items) {
          return renderSchema(schema.properties, '', collection, `properties/${collection}`)
        }
      })}
    </ul>)
  }

const renderSchema = (level, path, collection) => {
  const collectionPath = `${path}/${collection}`
  return (
    <li key={collectionPath}>
     <FormControlLabel value={collectionPath} control={<Radio color="primary"/>} label={collection} />
      {level[collection]?.items?.properties && (
        <ul key={'sub'+collection}>
         {Reflect.ownKeys(level[collection]?.items.properties).map(child => {    
            if (level[collection]?.items?.properties[child]?.items) {   
              return renderSchema(level[collection]?.items?.properties[child].items, collectionPath, child)}
         })}
          </ul>)
      }
    </li>)
}

const renderedSchema = renderSchemaRoot(schema, "", "", "")

  return (<div>

      <p>Find the collection to import data to</p>
      <FormControl component="fieldset">
      <FormLabel component="legend">Collection to import</FormLabel>
      <RadioGroup aria-label="collection" name="selectedCollection" value={selected} onChange={handleChange}>
        {renderedSchema}
        </RadioGroup>
    </FormControl>
    </div>)
}

const MapFields = ({onValidation, myStep}) => {

  const [inputs, setInputs] = useState([])
  const [outputs, setOutputs] = useState([])
  const [actions, setActions] = useState([])
  const [edges, setEdges] = useState([])
  const [rfInstance, setRfInstance] = useState(null);
  const { schema, getPropertyFor } = useSchema()
  const {config, setConfig, activeStep} = useImportConfig()

  useEffect(()=>{
    console.log(`Mapping step done activeStep ${activeStep} myStep: ${myStep}`)
    if( myStep !== activeStep) {
      const updatedConfig = {...config, mapper: rfInstance.toObject()}
      setConfig(updatedConfig)
      console.log("Saved data mapping", updatedConfig)
    }
  },[activeStep])

  useEffect(()=>{
    console.log('get property for pointer ', config.pointer, "From config ", config)
    if(config.pointer) {

      const property = getPropertyFor(config.pointer)

      const attributeNodes = Reflect.ownKeys(property.items.properties).reduce( (nodes, attribute, index) => {
        if( property.items.properties[attribute]?.type !== 'array'){
          nodes.push({
            id: `${index + 1000}`,
            required: property.items?.required.includes(attribute) ? 'yes': 'no', 
            name: attribute})
        }
        return nodes
      }, [])

      attributeNodes.unshift({ id: config.collectionPath, name: config.collectionId, key: 'yes', data: {collectionPath: config.collectionPath}})
      const inputNodes = config.structure.columns.map((column,index)=>({id: `${index}`, name: column}))
      setInputs(inputNodes)
      setOutputs(attributeNodes)
      setEdges(guessConnections(inputNodes, attributeNodes))
      // setInputs([{id: '1', name: 'förnamn'}, {id: '2', name: 'efternamn'}, {id: '3', name: 'age'}])
      // setOutputs([{id: '100', key: 'yes', name: 'Namn'}, {id: '101', required: 'yes', name: 'Ålder'}, {id: '102', name: 'Kön'}])
      // setActions([{
      //   id: '50',
      //   type: 'join',
      //   data: { joiner: "-"},
      //   position: { x: 250, y: 75 }
      // }])
      // setEdges([{source: '1', target: '50', targetHandle: 'a'},
      //  {source: '2', target: '50', targetHandle: 'b'},  {source: '50', target: '100'},
      //  {source: '3', target: '101'}])

      // setActions([])
      //  setEdges([])
      
      onValidation(true)
    }
  },[onValidation])

  const guessConnections = (inputNodes, argumentNodes) => {
    let connections = inputNodes.map( inputNode => {
        const arg = argumentNodes.find(arg => arg.name === inputNode.name)
        if (arg){
          return { source: inputNode.id, target: arg.id}
        } else {
          return null
        }
    }).filter(conn => conn !== null)

    return connections
  }

  return <>
    {myStep == activeStep && 
      <MapData
          inputs={inputs}
          outputs={outputs}
          actions={actions}
          edges={edges} 
          setRfInstance={setRfInstance}
          />
    }
  </>
}



