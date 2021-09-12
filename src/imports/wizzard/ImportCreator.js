import {
    Box,
    Button, Card, CardContent,
    makeStyles,
    Step,
    StepLabel,
    Stepper,
    Typography
} from "@material-ui/core";
import {WhatPanel} from "./WhatPanel";
import {useWizzard, WizzardProvider} from "./useWizzard";
import {HowPanel} from "./HowPanel";
import {ToPanel} from "./ToPanel";
import {FilePanel} from "./FilePanel";
import {WherePanel} from "./WherePanel";
import {TestPanel} from "./TestPanel";
import {ConfirmPanel} from "./ConfirmPanel";
import {useSnackbar} from 'notistack';
import {useStorage} from '../../firebase/useStorage'

const useStyles = makeStyles((theme) => ({
    container: {
        maxWidth: "70rem",
        margin: "auto",
    },
    step: {
        minHeight: "50vh",
        marginTop: "2rem"
    },
    stepNavigation: {
        margin: "1rem",
        display: "flex",
        justifyContent: "space-between"
    },
    button: {
        marginRight: theme.spacing(1),
    },
}));

const ImportCreator = ({onAbort, onCreated}) => {

    return (
        <WizzardProvider>
            <ImportWizard onAbort={onAbort} onCreated={onCreated}/>
        </WizzardProvider>
    )
}
// {title:"What", subtitle: "Select what type of data you like to import"},
const steps = [
    {title: "File", subtitle: "Upload and handle the file you like to import"},
    {title: "How", subtitle: "Explain how your data is structured"},
    {title: "To", subtitle: "Select or create the storage structured for the imported result"},
    {title: "Where", subtitle: "Map where you like the imported data to end up in the collection"},
    {title: "Test", subtitle: "Give some of the expected import data a test run with this import configuration"},
    {title: "Confirm", subtitle: ""},
    {title: "Import", subtitle: ""}]

const ImportWizard = ({onAbort, onCreated}) => {
    const classes = useStyles();
    const {state} = useWizzard()
    const {addCollectionImport} = useStorage()
    const {enqueueSnackbar} = useSnackbar()


    const handleSaveConfig = async () => {
        const configId = await addCollectionImport(state)
        const importer = {id: configId, config: state}
        console.log('Saved import', importer)
        enqueueSnackbar("Saved import", {variant: 'info'})

        onCreated(importer)
    };

    return (
        <div className={classes.container}>
            <Button readOnly={true} onClick={onAbort}>Back to list</Button>
            <p>Import Creator</p>
            <Stepper activeStep={state.step.active}>
                {steps.map(step => (
                    <Step key={step.title}>
                        <StepLabel>{step.title}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <StepNavigation {...steps[state.step.active]} onSave={handleSaveConfig}/>

            <Card>
                <CardContent>

                    <Typography variant="h3">{steps[state.step.active].title}</Typography>
                    <Typography variant="subtitle1">{steps[state.step.active].subtitle}</Typography>

                    <div className={classes.step}>
                        {state.step.active === 0 && (
                            // <WhatPanel/>
                            <FilePanel/>
                        )}
                        {state.step.active === 1 && (
                            <HowPanel/>
                        )}
                        {state.step.active === 2 && (
                            <ToPanel/>
                        )}
                        {state.step.active === 3 && (
                            <WherePanel/>
                        )}
                        {state.step.active === 4 && (
                            <TestPanel/>
                        )}
                        {state.step.active === 5 && (
                            <ConfirmPanel/>
                        )}
                    </div>

                </CardContent>
            </Card>
            <StepNavigation onSave={handleSaveConfig}/>
        </div>
    );
};

const StepNavigation = ({onSave}) => {
    const classes = useStyles();
    const {state, dispatch} = useWizzard()

    return (
        <div className={classes.stepNavigation}>
            <div>
                <Button
                    variant="outlined"
                    // color="primary"
                    disabled={!state.step.canBack}
                    onClick={() => dispatch({type: "BACK"})}
                > Back
                </Button>
            </div>

            <div>
                {state.step.hasNext && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => dispatch({type: "NEXT"})}
                        disabled={!state.step[`done_${state.step.active}`]}
                    >
                        Next
                    </Button>
                )}
                {!state.step.hasNext && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSave}
                    >
                        Save
                    </Button>
                )}
            </div>
        </div>
    )
}

export default ImportCreator;
