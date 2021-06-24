import {
  Box,
  Button,
  makeStyles,
  Step,
  StepLabel,
  Stepper,
} from "@material-ui/core";
import { WhatPanel } from "./WhatPanel";
import { useWizzard, WizzardProvider } from "./useWizzard";
import { HowPanel } from "./HowPanel";
import { WherePanel } from "./WherePanel";
import { TestPanel } from "./TestPanel";
import { ConfirmPanel } from "./ConfirmPanel";
import {useSnackbar} from 'notistack';
import { useStorage } from '../../../../firebase/useStorage'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}


const ImportCreator = ({ onAbort, onCreated }) => {

  return (
    <WizzardProvider>
      <ImportWizard onAbort={onAbort} onCreated={onCreated} />
    </WizzardProvider>
  )
}

const ImportWizard = ({onAbort, onCreated}) => {
  const classes = useStyles();
  const {state, dispatch} = useWizzard()
  const {addCollectionImport} = useStorage()
  const {enqueueSnackbar} = useSnackbar()
  

  const handleSaveConfig = async () => {
    const configId = await addCollectionImport(state)
    const importer = {id: configId, config: state}
    console.log('Saved import', importer)
    enqueueSnackbar("Saved import", { variant: 'info'})

    onCreated(importer)
  };

  return (
    <>
      <a readOnly={true} onClick={onAbort}>Back to list</a>
      <p>Import Creator</p>
      <Stepper activeStep={state.step.active}>
        <Step>
          <StepLabel>What</StepLabel>
        </Step>
        <Step>
          <StepLabel>How</StepLabel>
        </Step>
        <Step>
          <StepLabel>Where</StepLabel>
        </Step>
        <Step>
          <StepLabel>Test</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirm</StepLabel>
        </Step>
        <Step>
          <StepLabel>Import</StepLabel>
        </Step>
      </Stepper>
      {state.step.active === 0 && (
        <WhatPanel/>
      )}
      {state.step.active === 1 && (
        <HowPanel/>
      )}
      {state.step.active === 2 && (
        <WherePanel />
      )}
      {state.step.active === 3 && (
        <TestPanel />
      )}
      {state.step.active === 4 && (
        <ConfirmPanel />
      )}
      <Button
        disabled={!state.step.canBack}
        onClick={() => dispatch({ type: "BACK" })}
        className={classes.button}
      >
        Back
      </Button>
      {state.step.hasNext && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => dispatch({ type: "NEXT" })}
          className={classes.button}
          disabled={!state.step[`done_${state.step.active}`]}
        >
          Next
        </Button>
      )}
      {!state.step.hasNext && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveConfig}
          className={classes.button}
        >
          Save
        </Button>
      )}
    </>
  );
};

export default ImportCreator;
