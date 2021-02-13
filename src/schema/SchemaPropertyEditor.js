// @flow
import React, { useEffect, useState, } from 'react'
import { Button, Checkbox, FormControl, Icon, IconButton, InputLabel, makeStyles, NativeSelect,TextField, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { useSnackbar } from 'notistack';
import useDataConverter from '../components/useDataConverter';
import useSchema from './useSchema';

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

const SchemaPropertyEditor = ({ editing, schema, pointer, onDeleteRequest, onCreateNewRequest }) => {
    const classes = useStyles();
    const {collectionIdFor} = useSchema()

    const title = collectionIdFor(pointer)
    return (
        <div className={classes.root}>
            <h1>{title}</h1>


            
            {!schema && <p>No schema is created</p>}
            {!editing && schema && (
                <SchemaViewer schema={schema} />
            )}


            {editing && (
                <SchemaFormEditor schema={schema} pointer={pointer} onDeleteRequest={onDeleteRequest} onCreateNewRequest={onCreateNewRequest} />
              
            )}

        </div>
    )
}

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


const useFormEditorStyles = makeStyles((theme) => ({
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
}))

const SchemaFormEditor = ({ title, pointer, schema, onDeleteRequest, onCreateNewRequest }) => {
    const classes = useFormEditorStyles();
    const { enqueueSnackbar } = useSnackbar();
    const { formToJsonSchema, schemaPropsToList } = useDataConverter()
    const { control, register, watch, handleSubmit } = useForm();
    const { fields, append, remove, swap } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: "attribute", // unique name for your Field Array
        // keyName: "id", default to "id", you can change the key name
    });
    const {saveProperty} = useSchema()

    useEffect(() => {
        remove()
        schemaPropsToList(schema).forEach(append)

    }, [schema, append, remove, schemaPropsToList])


    const save = data => {
        try {
            const jsonSchemaData = formToJsonSchema(data)
            console.log("Saving ", pointer, data, jsonSchemaData)
            saveProperty(pointer, jsonSchemaData)
            enqueueSnackbar('Saved schema', { variant: 'success' })
        } catch (error) {
            console.log('Failed to save schema', error)
            enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        }
    }

    return (
        <>
            <FormProvider register={register} watch={watch} >
                <form id='attributes' onSubmit={handleSubmit(save)} >

                    {fields.length === 0 && (<p>No attributes added</p>)}

                    {fields.map((attribute, index) => (
                        <div key={index} >
                            {attribute.type === 'array' && (
                                <SchemaSubCollectionFieldFormProperty key={index} attribute={attribute} index={index}>
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
                                <SchemaFieldFormProperty key={index} attribute={attribute} index={index}>
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
                        </div>
                    ))}
                </form>

                <AddSchemaFormProperty onAdd={append} />

                <div className={classes.editField}>
                    <Button variant="contained" color="primary" type='submit' form='attributes'>
                        Save
                    </Button>
                </div>

                <CollectionInfo title={title} pointer={pointer} onDeleteRequest={onDeleteRequest} onCreateNewRequest={onCreateNewRequest}  >
                </CollectionInfo>


            </FormProvider>
        </>
    )
}


const useCollectionInfoStyles = makeStyles((theme) => ({
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
    },
    actionCommands: {
        paddingTop: theme.spacing(3)
    }
}))
const CollectionInfo = ({pointer, onCreateNewRequest, onDeleteRequest}) => {
    const classes = useCollectionInfoStyles()

    useEffect(()=>{

    }, [pointer])

    const handleAddSubCollectionClick = () => {
        onCreateNewRequest(pointer)
    }

    const handleDeleteCollectionClick = () => {
        onDeleteRequest(pointer)
    }

    return (
    <div className={classes.actionCommands}>

        <div className={classes.collectionInfo}>
            <p>Info</p>
        </div>

        <div>
            <Button variant="contained" color="secondary" type='submit' form='attributes' onClick={handleAddSubCollectionClick}>
                Create collection
            </Button>

            <Button variant="contained" color="secondary" type='submit' form='attributes' onClick={handleDeleteCollectionClick}>
                Delete
            </Button>
        </div>
    </div>)
}

const SchemaSubCollectionFieldFormProperty = ({ attribute, index, children }) => {
    const classes = useFormEditorStyles();
    const { register } = useFormContext();

    return (
        <div className={classes.editRow} >
            <TextField
                name={`attribute[${index}].key`}
                inputRef={register()}
                label='Collection name'
                disabled={true}
                defaultValue={attribute.key} />

            <TextField
                name={`attribute[${index}].description`}
                inputRef={register()}
                label='Description'
                defaultValue={attribute.description} />
            
            <input 
                name={`attribute[${index}].key`}
                type='hidden'
                defaultValue={attribute.key}
                ref={register()}/>

            <input 
                name={`attribute[${index}].type`}
                type='hidden'
                defaultValue={attribute.type}
                ref={register()}/>

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
                            inputRef={register()}
                            defaultValue={attribute.minLength} />
                        <TextField
                            label='Max lenght'
                            name={`attribute[${index}].maxLength`}
                            type="number"
                            inputRef={register()}
                            defaultValue={attribute.maxLength} />
                        <TextField
                            name={`attribute[${index}].pattern`}
                            inputRef={register()}
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
                            inputRef={register()}
                            defaultValue={attribute.minimum} />
                        <TextField
                            label='Max value'
                            name={`attribute[${index}].maximum`}
                            type="number"
                            inputRef={register()}
                            defaultValue={attribute.maximum} />
                    </>
                )}
                {type === 'number' && (
                    <>
                        <TextField
                            label='Min value'
                            name={`attribute[${index}].minimum`}
                            type="number"
                            inputRef={register()}
                            defaultValue={attribute.minimum} />
                        <TextField
                            label='Max value'
                            name={`attribute[${index}].maximum`}
                            type="number"
                            inputRef={register()}
                            defaultValue={attribute.maximum} />
                    </>
                )}
                 <TextField
                    name={`attribute[${index}].description`}
                    inputRef={register()}
                    label='Description'
                    defaultValue={attribute.description} />
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

                <IconButton aria-label="delete" className={classes.margin} type='submit'>
                        <Icon color="secondary">add_circle</Icon>
                </IconButton>

            </div>
        </form>
    )
}


export default SchemaPropertyEditor