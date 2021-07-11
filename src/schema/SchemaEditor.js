import {useEffect, useState,} from 'react'
import {
    AppBar,
    Box,
    Button,
    Checkbox,
    FormControl,
    Icon,
    IconButton,
    InputLabel,
    makeStyles,
    NativeSelect,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    useTheme
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import {FormProvider, useFieldArray, useForm, useFormContext} from 'react-hook-form'
// import { saveSchema } from '../firebase/storage'
import {useSnackbar} from 'notistack';
import {useSession} from '../firebase/UserProvider';
import {useWorkspace} from '../components/workspace/useWorkspace';
import useDataConverter from '../components/useDataConverter';

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

const SchemaEditor = ({ collectionId, collectionPath, editing, schema }) => {
    const classes = useStyles();
    const { claims } = useSession()
    const { wid } = useWorkspace()
    const theme = useTheme();
    const [tab, setTab] = useState(0);


    const handleTabChange = (_, id) => {
        setTab(id);
    };

    const tenantId = claims.myThings.tenantId

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

const SchemaViewer = ({ schema }) => {
    const { schemaPropsToList } = useDataConverter()
    const [schemaProps, setSchemaProps] = useState([])
    useEffect(() => {
        setSchemaProps(schemaPropsToList(schema))
    }, [schema, schemaPropsToList])

    return (<>
        {schemaProps.map((prop, index) =>
            <p key={index}>
                <strong>{prop.key}</strong> is a {prop.type} and is {prop.required ? '' : 'not'} required
            </p>
        )}

    </>)

}


const RawEditor = ({ tenantId, wid, collectionPath, schema }) => {
    const classes = useRawEditorStyles();
    const { register, handleSubmit, setValue } = useForm()

    useEffect(() => {

        setValue('raw', JSON.stringify(schema, null, 2), {
            shouldValidate: true,
            shouldDirty: true
        })
    }, [schema, setValue])

    const save = data => {
        // const schemaToSave = JSON.parse(data.raw)
        // console.log("Saving ", schemaToSave)
        // try {

        //     saveSchema(tenantId, wid, collectionPath, schemaToSave)
        //     enqueueSnackbar('Saved schema', { variant: 'success' })
        // } catch (error) {
        //     console.log('Failed to save schema', error)
        //     enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        // }
    }


    return (
        <form onSubmit={handleSubmit(save)} >
            <div className={classes.editRow} >
                <TextField
                    className={classes.editField}
                    name='raw'
                    {...register("raw")}
                    label='JSON'
                    rows={30}
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
    },
    divider: {
        width: '100%',
        height: '3rem'
    }
});

const SchemaFormEditor = ({ tenantId, wid, collectionId, collectionPath, schema }) => {
    const classes = useFormEditorStyles();
    const { schemaPropsToList } = useDataConverter()
    const { control, register, watch, handleSubmit } = useForm();
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
        // try {
        //     const jsonSchemaData = formToJsonSchema(window.location.host, collectionId, data)
        //     console.log("Saving ", data, jsonSchemaData)
        //     saveSchema(tenantId, wid, collectionPath, jsonSchemaData)
        //     enqueueSnackbar('Saved schema', { variant: 'success' })
        // } catch (error) {
        //     console.log('Failed to save schema', error)
        //     enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        // }
    }

    const handleNewCollection = data => {

        append(
            {
                key: data.key,
                type: 'array',
                description: data.description || '',
                order: 100
            }
        )
    }


    return (
        <>
            <FormProvider register={register} watch={watch} >
                <form id='attributes' onSubmit={handleSubmit(save)} >

                    {fields.map((attribute, index) => (
                        <>
                            {attribute.type === 'array' && (
                                <SchemaSubCollectionFieldFormProperty key={attribute.id} attribute={attribute} index={index}>
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
                                </SchemaSubCollectionFieldFormProperty>
                            )}
                            {attribute.type !== 'array' && (
                                <SchemaFieldFormProperty key={attribute.id} attribute={attribute} index={index}>
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
                            )}
                        </>
                    ))}
                </form>
                
                <AddSchemaFormProperty onAdd={append} />

                <div className={classes.editField}>
                    <Button variant="contained" color="primary" type='submit' form='attributes'>
                        Save
                    </Button>
                </div>


                <AddNewCollection forbiddenNames={[]} onNewCollection={handleNewCollection} />


            </FormProvider>
        </>
    )
}
const SchemaSubCollectionFieldFormProperty = ({ attribute, index, children }) => {
    const classes = useFormEditorStyles();
    const { register } = useFormContext();

    return (
        <div className={classes.editRow} >
            <TextField
                name={`attribute[${index}].key`}
                {...register(`attribute[${index}].key`)}
                label='Collection name'
                defaultValue={attribute.key} />

            <TextField
                name={`attribute[${index}].description`}
                {...register(`attribute[${index}].description`)}
                label='Description'
                defaultValue={attribute.description} />
            
            <input 
                name={`attribute[${index}].type`}
                type='hidden'
                defaultValue={attribute.type}
                {...register(`attribute[${index}].type`)}/>

            <div className={classes.actions}>
                {children}
            </div>
        </div>)
}

const SchemaFieldFormProperty = ({ attribute, index, children }) => {
    const classes = useFormEditorStyles();
    const { register, watch } = useFormContext();

    const type = watch(`attribute[${index}].type`, attribute.type)

    return (
        <>
            <div className={classes.editRow} >
                <TextField
                    name={`attribute[${index}].key`}
                    {...register(`attribute[${index}].key`)}
                    label='Attribute name'
                    defaultValue={attribute.key} />
}
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor={`type_${index}`}>Type</InputLabel>
                    <NativeSelect
                        id={`type_${index}`}
                        name={`attribute[${index}].type`}
                        {...register(`attribute[${index}].type`)}
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
                        {...register(`attribute[${index}].required`)}
                        defaultChecked={attribute.required}
                        inputProps={{ 'aria-label': 'Is required' }}
                    />
                </Tooltip>
                <TextField
                    name={`attribute[${index}].description`}
                    {...register(`attribute[${index}].description`)}
                    label='Description'
                    defaultValue={attribute.description} />


                <div className={classes.actions}>
                    {children}
                </div>
            </div>
            <div className={classes.editRow} >
                {type === 'string' && (
                    <>
                        <TextField
                            label='Min lenght'
                            name={`attribute[${index}].minLength`}
                            type="number"
                            {...register()}
                            defaultValue={attribute.minLength} />
                        <TextField
                            label='Max lenght'
                            name={`attribute[${index}].maxLength`}
                            type="number"
                            {...register(`attribute[${index}].maxLength`)}
                            defaultValue={attribute.maxLength} />
                        <TextField
                            name={`attribute[${index}].pattern`}
                            {...register(`attribute[${index}].pattern`)}
                            label='Pattern'
                            defaultValue={attribute.pattern} />
                    </>
                )}
                {type === 'integer' && (
                    <>
                        <TextField
                            label='Min value'
                            name={`attribute[${index}].minimum`}
                            type="number"
                            {...register(`attribute[${index}].minimum`)}
                            defaultValue={attribute.minimum} />
                        <TextField
                            label='Max value'
                            name={`attribute[${index}].maximum`}
                            type="number"
                            {...register(`attribute[${index}].maximum`)}
                            defaultValue={attribute.maximum} />
                    </>
                )}
                {type === 'number' && (
                    <>
                        <TextField
                            label='Min value'
                            name={`attribute[${index}].minimum`}
                            type="number"
                            {...register(`attribute[${index}].minimum`)}
                            defaultValue={attribute.minimum} />
                        <TextField
                            label='Max value'
                            name={`attribute[${index}].maximum`}
                            type="number"
                            {...register(`attribute[${index}].maximum`)}
                            defaultValue={attribute.maximum} />
                    </>
                )}
            </div>
            <div className={classes.divider} ></div>
        </>)
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
            <p>New attribute</p>
            <div className={classes.editRow} >
                <TextField
                    name={`key`}
                    {...register("key")}
                    label='Attribute name' />

                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="add-type">Type</InputLabel>
                    <NativeSelect
                        id='add-type'
                        name={`type`}
                        {...register(`type`)}
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
                        {...register(`required`)}
                    />
                </Tooltip>
                <TextField
                    name={`description`}
                    {...register(`description`)}
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

 const AddNewCollection = ({ forbiddenNames, onNewCollection }) => {
    const { handleSubmit, register, reset, errors } = useForm()

    const onSubmit = data => {
        console.log('onNewCollection', data)
        onNewCollection(data)
        reset()
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <p>New collection</p>
            <TextField name='key' label="Name" required='true' {...register('key', {
                    required: 'You forgot to name your new collection',
                    validate: value => {
                        console.log('validate ', value, forbiddenNames)
                        if (value.startsWith('_')) return "Collections are not allowed"
                        if (forbiddenNames) {
                            return !forbiddenNames.includes(value) || 'Collection name must be uniqe'
                        }
                        return true
                    }
                })}
                helperText={errors.key?.message}
                error={errors.key ? true : false} />

            <TextField
                name='description'
                {...register('description')}
                label='Description' />

{/* "minItems": 2,
  "maxItems": 3 */}
            <IconButton aria-label="add" type='submit'>
                <Icon>add_circle</Icon>
            </IconButton>
        </form>)
}

export default SchemaEditor