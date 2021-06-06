import React, {useEffect, useState} from 'react'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions as MuiDialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    makeStyles,
    NativeSelect,
    TextField,
    Typography
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import useDataConverter from '../components/useDataConverter';
import {useSchema} from './useSchema'
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {useStorage} from '../firebase/useStorage';


const usePropertiesEditorStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}));

const PropertiesEditor = ({ pointer, subSchema }) => {
    const classes = usePropertiesEditorStyles();
    const [editing, setEditing] = useState()
    const [properties, setProperties] = useState([])
    const [title, setTitle] = useState()
    const [info, setInfo] = useState()
    const { enqueueSnackbar } = useSnackbar()
    const { collectionIdFor } = useSchema()
    const { usageOf } = useStorage()
    const { schemaPropsToList, explainTypeToText } = useDataConverter()

    useEffect(() => {
        const loaded = schemaPropsToList(subSchema)
        console.log('Loaded ', loaded)
        setProperties(loaded)

    }, [subSchema, schemaPropsToList])


    useEffect(() => {
        setTitle(collectionIdFor(pointer))

        usageOf(pointer,
            loaded => setInfo(loaded),
            error => {
                console.log('Failed to load usage info for pointer ', pointer, error)
                enqueueSnackbar("Failed to load usage info")
            })

    }, [pointer, collectionIdFor, enqueueSnackbar])

    return (
        <>
            <Typography variant='h2'>{title}</Typography>
            <Typography variant='body1'>{info}</Typography>
            <Typography variant='h3'>Attributes:</Typography>
            {(!properties || properties.length == 0) && (<p>No arguments is added yet</p>)}

            {properties && properties
                .filter(prop => prop.type !== 'array')
                .map((prop, index) =>
                    <div key={prop.key}>
                        {prop.key}{prop.required ? '*' : ''} - {prop.type}
                        {explainTypeToText(prop)}

                        <EditPropertyDialogTrigger pointer={pointer} property={prop} />
                    </div>
                )}


            <AddPropertyDialogTrigger pointer={pointer} />

            <Typography variant='h3' >Child collections:</Typography>

            {properties && properties
                .filter(prop => prop.type === 'array')
                .map((prop, index) =>
                    <Accordion key={prop.key}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`arg-panel${index}-content`}
                            id={`arg-panel${index}-header`}
                        >
                            <Typography className={classes.heading}>{prop.key}{prop.required ? '*' : ''} - {prop.type}</Typography>
                            <Typography className={classes.secondaryHeading}> {explainTypeToText(prop)}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>

                            {/* <pre>{JSON.stringify(prop, null, 2)}</pre> */}
                            {prop.key !== editing && (
                                <PropertyViewer pointer={pointer} property={prop} onStartEditing={() => setEditing(prop.key)}></PropertyViewer>
                            )}
                            {prop.key === editing && (
                                <PropertyEditor pointer={pointer} property={prop} onStopEdit={() => setEditing()}></PropertyEditor>
                            )}


                        </AccordionDetails>

                    </Accordion>
                )}
            <Accordion >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`arg-panel-add-sub-content`}
                    id={`arg-panel-add-sub-header`}
                >
                    <Typography className={classes.heading}>Add child collection</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <AddNewCollection pointer={pointer} />
                </AccordionDetails>
            </Accordion>


        </>
    )

}

const PropertyViewer = ({ pointer, property, onStartEditing }) => {
    console.log('Render', property)
    return (
        <div>
            <p>{pointer} - {property.key}</p>
            <Button onClick={onStartEditing}>Edit</Button>
        </div>)
}

const PropertyEditor = ({ pointer, property, onStopEdit }) => {
    const { formToJsonSchema, saveProperty } = useSchema()
    const { enqueueSnackbar } = useSnackbar();

    console.log('Loaded ', property)

    const handleSave = data => {
        try {
            const jsonSchemaData = formToJsonSchema(data)
            console.log("Saving ", pointer, data, jsonSchemaData)
            saveProperty(pointer, jsonSchemaData)
            onStopEdit()
            enqueueSnackbar('Saved schema', { variant: 'success' })
        } catch (error) {
            console.log('Failed to save schema', error)
            enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        }
    }

    return (
        <>
            <p>EDIT {pointer} - {property.key}</p>
            <Button onClick={onStopEdit}>Abort</Button>
            <Button onClick={handleSave}>Save</Button>
        </>
    )

}


const AddNewProperty = ({ property }) => {
    const { register, watch, errors } = useFormContext()

    const type = watch(`type`, property?.type)

    return (

        <Grid spacing={1}
            container
            direction="column"
            justify="center"
            alignItems="stretch"
        >
            {property?.key && (
                <input
                    {...register(`key`)}
                    defaultValue={property.key}
                    type='hidden'
                />
            )}
            {!(property?.key) && (
                <TextField
                    label='Attribute name'
                    {...register("key", { required: 'A attribute key is required' })}
                    defaultValue={property?.key}
                    helperText={errors.key?.message}
                    error={errors.key ? true : false}
                />
            )}

            <FormControl>
                <InputLabel htmlFor="type" error={errors.type ? true : false}>Type, {property?.type} loaded</InputLabel>
                <NativeSelect
                    id='type'
                    name={`type`}
                    {...register("type", { required: 'Select type' })}
                    defaultValue={property?.type}
                    label='Type'
                    aria-describedby="type-helper-text"
                    error={errors.type ? true : false}
                >
                    <option aria-label="Select a type" value="" />
                    <option value='string'>Text</option>
                    <option value='number'>Number</option>
                    <option value='integer'>Integer</option>
                </NativeSelect>
                <FormHelperText id="type-helper-text" error={errors.type ? true : false}>{errors.type?.message}</FormHelperText>
            </FormControl>

            {type === 'string' && (
                <>
                    <TextField
                        label='Min lenght'
                        name={`minLength`}
                        type="number"
                        {...register("minLength")}
                        defaultValue={property?.minLength} />
                    <TextField
                        label='Max lenght'
                        name={`maxLength`}
                        type="number"
                        {...register("maxLength")}
                        defaultValue={property?.maxLength} />
                    <TextField
                        name={`pattern`}
                        {...register("pattern")}
                        label='Pattern'
                        defaultValue={property?.pattern} />
                </>
            )}
            {type === 'integer' && (
                <>
                    <TextField
                        label='Min value'
                        name={`minimum`}
                        type="number"
                        {...register("minimum")}
                        defaultValue={property?.minimum} />
                    <TextField
                        label='Max value'
                        name={`maximum`}
                        type="number"
                        {...register("maximum")}
                        defaultValue={property?.maximum} />
                </>
            )}
            {type === 'number' && (
                <>
                    <TextField
                        label='Min value'
                        name={`minimum`}
                        type="number"
                        {...register("minimum")}
                        defaultValue={property?.minimum} />
                    <TextField
                        label='Max value'
                        name={`maximum`}
                        type="number"
                        {...register("maximum")}
                        defaultValue={property?.maximum} />
                </>
            )}
            <TextField
                name={`description`}
                {...register("description")}
                label='Description'
                defaultValue={property?.description} />

            <FormControlLabel
                label={` Is required`}
                labelPlacement="end"
                style={{ marginTop: '12px', marginLeft: '-4px' }}
                control={
                    <input name="isRequired" type='checkbox' ref={register} defaultChecked={property?.required} value="yupp" />
                } />


        </Grid>)
}

const EditPropertyDialogTrigger = ({ pointer, property }) => {
    const [open, setOpen] = useState(false)
    const { collectionIdFor } = useSchema()


    return (
        <>
            <IconButton
                aria-label="Update property"
                type='submit'
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
            >
                <SettingsIcon />
            </IconButton>

            <AddPropertyDialog
                title={`Edit attribute ${property.key} for ${collectionIdFor(pointer)}`}
                pointer={pointer}
                property={property}
                open={open}
                setOpen={setOpen} />
        </>)
}

const AddPropertyDialogTrigger = ({ pointer }) => {
    const [open, setOpen] = useState(false)
    const { collectionIdFor } = useSchema()

    return (
        <div>
            <Button
                aria-label="Add new property"
                type='submit'
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => setOpen(true)}>
                Add property
            </Button>
            <AddPropertyDialog
                title={`Create new attribute for ${collectionIdFor(pointer)}`}
                pointer={pointer}
                open={open}
                setOpen={setOpen} />
        </div>)
}
const AddPropertyDialog = ({ title, pointer, property, open, setOpen }) => {

    const methods = useForm();
    const { handleSubmit, reset } = methods
    const { } = useDataConverter()
    const { addProperty, deleteProperty } = useSchema()
    const confirm = useConfirm();
    const isNew = property == undefined


    const handleAdd = property => {
        console.log("Add ", property, pointer)
        const { key, isRequired } = property
        const required = isRequired == 'yupp'
        delete property.key
        delete property.isRequired


        addProperty(pointer, key, required, property)
        reset()
        setOpen(false);
    }


    const handleDeleteClick = () => {
        console.log(`Do delete ${property.key} from ${pointer}`)
        confirm({ 
            title: `Are you sure you like to delete argument ${property.key}?`,
            description: 'This action is permanent!',
            confirmationText: 'Yes',
            cancellationText: 'No' })
            .then(() => { 
                console.log(`Confirmed to delete ${property.key} from ${pointer}`)
                deleteProperty(pointer, property.key)
            })
    }

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="confirm-dialog"
        >

            <form onSubmit={handleSubmit(handleAdd)}>
                <DialogTitle id="confirm-dialog">{title}</DialogTitle>
                <DialogContent>
                    <FormProvider {...methods} >
                        <AddNewProperty property={property} />
                    </FormProvider>

                </DialogContent>
                <MuiDialogActions>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                    >
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={() => setOpen(false)}
                        >Cancel</Button>

                   
                        <Button
                            color="primary"
                            variant="contained"
                            type='submit'
                            aria-label={ isNew ? "Add new property" : "Update property"}
                            startIcon={<SaveIcon />}
                        >Save</Button>
                    </Grid>

                </MuiDialogActions>
            </form>

            {!isNew && (
                <Box display="flex" justifyContent="flex-start" padding='8px'>
                    {/* <MuiDialogActions justifyContent="flex-start"> */}
                        <Button
                            color="secondary"
                            variant="outlined"
                            aria-label="Delete property"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteClick}
                        >Delete me</Button>
                    {/* </MuiDialogActions> */}
                    </Box>
                    )}
        </Dialog>
    );
}



const AddNewCollection = () => {

    return <p>AddNewCollection</p>
}
export default PropertiesEditor