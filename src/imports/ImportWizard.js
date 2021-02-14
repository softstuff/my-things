import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import Ajv from "ajv"

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
      return <DataStructure onValidation={onValidation}/>
    case 1:
      return <SetCollection onValidation={onValidation}/>
    case 2:
      return <MapFields onValidation={onValidation}/>
    default:
      return 'Unknown step';
  }
}

export default function  ImportWizard({}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [isStepValid, setIsStepValid] = React.useState(0);
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
    </div>
  );
}


const DataStructure = ({onValidation}) => {
  const [guess, setGuess] = useState()

  const handleGuessStructure = (e) => {
    const sample = e.target.value
    const _guess = guessStructure(sample)
    setGuess( _guess )
    onValidation(_guess.valid)
  }
  

  return (
    <div>
        <TextField name='sample' multiline={true} rows={20} placeholder='Add a part of the data sample' onChange={handleGuessStructure} />

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
      guess.columns = firstRow.split(guess.delimiter).length
      guess.text = `My guess is that this is a CSV file with delimiter ${guess.delimiter} with ${guess.columns} columns`
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


const SetCollection = ({onValidation}) => {

  useEffect(()=>{
    onValidation(true)
  },[onValidation])

  return <p>Find the collection to import data to</p>
}

const MapFields = ({onValidation}) => {

  useEffect(()=>{
    onValidation(true)
  },[onValidation])

  return <p>Time to map input to output</p>
}
