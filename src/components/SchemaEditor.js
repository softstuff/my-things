// @flow
import React, { useEffect, useState, } from 'react'
import { AppBar, Box, Button, Checkbox, FormControl, Icon, IconButton, InputLabel, makeStyles, NativeSelect, Tab, Tabs, TextField, Tooltip, useTheme } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { useFieldArray, useForm } from 'react-hook-form'
import { saveSchema } from '../firebase/storage'
import { useSnackbar } from 'notistack';
import { useSession } from '../firebase/UserProvider';
import { useWorkspace } from './WorkspaceProvider';
import useDataConverter from './useDataConverter';

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

const SchemaEditor = ({ collectionId, collectionPath, editing, schema }) => {
    const classes = useStyles();
    const { claims } = useSession()
    const { workspace } = useWorkspace()
    const theme = useTheme();
    const [tab, setTab] = React.useState(0);
    

    const handleTabChange = (_, id) => {
        setTab(id);
    };

    const tenantId = claims.myThings.tenantId
    const wid = workspace.id

    return (
        <div className={classes.root}>
            <h1>Schemas</h1>

            {!schema && <p>No schema is created</p>}
            {!editing && schema && (
                <SchemaViewer schema={schema} />
            )}
            

            {editing && (
                <>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            aria-label="full width tabs example"
                        >
                            <Tab label="By form" {...a11yProps(0)} />
                            <Tab label="By JSON" {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>

                    <TabPanel value={tab} index={0} dir={theme.direction}>
                        <SchemaFormEditor tenantId={tenantId} wid={wid} collectionId={collectionId} collectionPath={collectionPath} schema={schema} />
                    </TabPanel>
                    <TabPanel value={tab} index={1} dir={theme.direction}>
                        <RawEditor tenantId={tenantId} wid={wid} collectionPath={collectionPath} schema={schema} />
                    </TabPanel>
                </>
            )}

        </div>
    )
}


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const useRawEditorStyles = makeStyles({
    editRow: {
        width: '100%',
    },
    editField: {
        width: '100%',
    },
});

const SchemaViewer = ({schema}) => {
    const {schemaPropsToList} = useDataConverter()
    const [schemaProps, setSchemaProps] = useState([])
    useEffect(() => {
        setSchemaProps(schemaPropsToList(schema))
    }, [schema, schemaPropsToList])

    return (<>
        {schemaProps.map( (prop, index) =>
            <p key={index}>
                <strong>{prop.key}</strong> is a {prop.type} and is {prop.required ? '': 'not'} required
            </p>
        )}

    </>)
    
} 


const RawEditor = ({ tenantId, wid, collectionPath, schema }) => {
    const classes = useRawEditorStyles();
    const { register, handleSubmit, setValue } = useForm()
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {

        setValue('raw', JSON.stringify(schema, null, 2), {
            shouldValidate: true,
            shouldDirty: true
        })
    }, [schema, setValue])

    const save = data => {
        const schemaToSave = JSON.parse(data.raw)
        console.log("Saving ", schemaToSave)
        try {

            saveSchema(tenantId, wid, collectionPath, schemaToSave)
            enqueueSnackbar('Saved schema', { variant: 'success' })
        } catch (error) {
            console.log('Failed to save schema', error)
            enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        }
    }


    return (
        <form onSubmit={handleSubmit(save)} >
            <div className={classes.editRow} >
                <TextField
                    className={classes.editField}
                    name='raw'
                    inputRef={register}
                    label='JSON'
                    rows={5}
                    multiline
                    variant="outlined" />
                <div className={classes.editField}>
                    <Button variant="contained" color="primary" type='submit'>
                        Save
                </Button>
                </div>
            </div>
        </form>
    )
}

const useFormEditorStyles = makeStyles({
    editRow: {
        width: '100%',
        display: 'flex',
        flexFlow: 'row wrap',
        alignItem: 'center'
    },
    editField: {
        // width: '100%',
    },
    actions: {
        padding: '12px'
    }
});

const SchemaFormEditor = ({ tenantId, wid, collectionId, collectionPath, schema }) => {
    const classes = useFormEditorStyles();
    const { enqueueSnackbar } = useSnackbar();
    const { formToJsonSchema, schemaPropsToList } = useDataConverter()
    const { control, register, handleSubmit } = useForm();
    const { fields, append, remove, swap } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: "attribute", // unique name for your Field Array
        // keyName: "id", default to "id", you can change the key name
    });

    useEffect(() => {
        remove()
        schemaPropsToList(schema).forEach(append)

    }, [schema, append, remove, schemaPropsToList])


    const save = data => {


        try {
            const jsonSchemaData = formToJsonSchema(collectionId, data)
            console.log("Saving ", data, jsonSchemaData)
            saveSchema(tenantId, wid, collectionPath, jsonSchemaData)
            enqueueSnackbar('Saved schema', { variant: 'success' })
        } catch (error) {
            console.log('Failed to save schema', error)
            enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        }
    }


    return (
        <>
            <form id='attributes' onSubmit={handleSubmit(save)} >

                {fields.map((attribute, index) => (
                    <SchemaFieldFormProperty key={attribute.id} attribute={attribute} index={index} register={register}>
                        <IconButton aria-label="delete" className={classes.margin} onClick={() => remove(index)}>
                            <DeleteIcon />
                        </IconButton>
                        {index > 0 && (
                            <IconButton aria-label="move up" onClick={() => swap(index - 1, index)}>
                                <Tooltip title="Move up">
                                    <ArrowUpwardIcon fontSize="small" />
                                </Tooltip>
                            </IconButton>
                        )}
                        {index < fields.length - 1 && (
                            <IconButton aria-label="move down" onClick={() => swap(index, index + 1)}>
                                <Tooltip title="Move down">
                                    <ArrowDownwardIcon fontSize="small" />
                                </Tooltip>
                            </IconButton>
                        )}

                    </SchemaFieldFormProperty>
                ))}

            </form>
            <AddSchemaFormProperty onAdd={append} />
            <div className={classes.editField}>
                <Button variant="contained" color="primary" type='submit' form='attributes'>
                    Save
                </Button>
            </div>
        </>
    )
}

const SchemaFieldFormProperty = ({ attribute, index, register, children }) => {
    const classes = useFormEditorStyles();

    return (
        <div className={classes.editRow} >
            <TextField
                name={`attribute[${index}].key`}
                inputRef={register()}
                label='Attribute name'
                defaultValue={attribute.key} />

            <FormControl className={classes.formControl}>
                <InputLabel htmlFor={`type_${index}`}>Type</InputLabel>
                <NativeSelect
                    id={`type_${index}`}
                    name={`attribute[${index}].type`}
                    inputRef={register()}
                    defaultValue={attribute.type}
                >
                    <option aria-label="Select a type" value="" />
                    <option value='string'>Text</option>
                    <option value='number'>Number</option>
                    <option value='integer'>Integer</option>
                </NativeSelect>
            </FormControl>
            <Tooltip title="required">
                <Checkbox
                    name={`attribute[${index}].required`}
                    color="primary"
                    inputRef={register()}
                    defaultChecked={attribute.required}
                    inputProps={{ 'aria-label': 'Is required' }}
                />
            </Tooltip>
            <TextField
                name={`attribute[${index}].description`}
                inputRef={register()}
                label='Description'
                defaultValue={attribute.description} />

            <div className={classes.actions}>
                {children}
            </div>
        </div>)
}


const AddSchemaFormProperty = ({ onAdd }) => {
    const classes = useFormEditorStyles();
    const { register, handleSubmit, reset } = useForm();

    const handleChange = event => console.log('Ohh you clicked me ', event.target)

    const handleAdd = data => {
        onAdd(data)
        reset()
    }

    return (
        <form onSubmit={handleSubmit(handleAdd)}>
            <div className={classes.editRow} >
                <TextField
                    name={`key`}
                    inputRef={register()}
                    label='Attribute name' />

                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="add-type">Type</InputLabel>
                    <NativeSelect
                        id='add-type'
                        name={`type`}
                        inputRef={register()}
                    >
                        <option aria-label="Select a type" value="" />
                        <option value='string'>Text</option>
                        <option value='number'>Number</option>
                        <option value='integer'>Integer</option>
                    </NativeSelect>
                </FormControl>
                <Tooltip title="required">
                    <Checkbox
                        onChange={handleChange}
                        name={`required`}
                        color="primary"
                        inputRef={register()}
                    />
                </Tooltip>
                <TextField
                    name={`description`}
                    inputRef={register()}
                    label='Description' />

                <div className={classes.actions}>
                    <IconButton aria-label="delete" className={classes.margin} type='submit'>
                        <Icon color="primary">add_circle</Icon>
                    </IconButton>
                </div>

            </div>
        </form>
    )
}
export default SchemaEditor