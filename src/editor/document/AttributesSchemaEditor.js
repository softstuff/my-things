import {Button, IconButton, makeStyles, TextField} from '@material-ui/core';
import React, {useEffect} from 'react'
import {useFieldArray, useForm} from 'react-hook-form';
import DeleteIcon from '@material-ui/icons/Delete';
import useDataConverter from './../../components/useDataConverter';
import useValidator from './../../components/useValidator';

const useStyles = makeStyles((theme) => ({
    editRow: {
        width: '100%',
        height: '4rem'
    },
    editField: {
        width: '20rem'
    },
    newAttribName: {
        width: '10rem'
    },
    newAttribValue: {
        width: '10rem'
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
      },
}));


const AttributesSchemaEditor = ({create, doc, onSaveThing, schema}) => {
    const classes = useStyles();
    const {schemaPropsToList} = useDataConverter()
    const {validateField} = useValidator()
    const { register, handleSubmit, control, errors: grrerrors} = useForm()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "thing", 
    });
    console.log("ERROR is ", grrerrors)


    const validateValue = (value, key) => {
        
        console.log('validateValue: ', JSON.stringify( {[key]: value }))
        const result = validateField( key, value, schema)
        if(!result.valid){
            console.log(JSON.stringify(value) + " has error ", result.errors[0])
            return result.errors[0]
        }
        console.log("valid")
        return true
    }

    const handleSave = (thing) => {
        console.log('handleSave', thing)
        onSaveThing(thing)
    }
   
    const toInputType = (type) => {
        console.log("toInputType", type, type === 'string' ? 'text' : 'number')
        return type === 'string' ? 'text' : 'number'
    }

    useEffect(() => {
        const schemaArgs = schemaPropsToList(schema)
        const schemaKeys = schemaArgs.map(arg=>arg.key)
        remove()
        console.log('AttributesSchemaEditor - Init ', doc, schemaArgs, schemaKeys)
        schemaArgs.forEach(arg => {
            append({
                name: arg.key,
                value: doc?.thing[arg.key],
                description: arg.description,
                type: toInputType(arg.type),
                validate: (value) => validateValue(value, arg.key, arg.type)
            })
        })

        doc?.thing && Reflect.ownKeys(doc.thing)
            .filter(name=> !schemaKeys.includes(name))
            .forEach(attribute => {
                append({name: attribute, value: doc.thing[attribute]})
            })

    }, [doc, schema, schemaPropsToList, remove, append])
    
    
    return (
        <>
            <form id='thing-form' onSubmit={handleSubmit(handleSave)}>
                {create && (
                    <TextField className={classes.editField} label='id' name='id' {...register("id", { required: "The key is required"})}/>                
                )}
                <h2>Attributes</h2>
                {fields.map((item, index) => (
                    <div className={classes.editRow} key={item.id}>
                        <TextField className={classes.editField} 
                        name={item.name}
                        label={item.name}
                        type={item.type}
                        {...register(item.name,{
                            validate: item.validate
                        })}
                        defaultValue={item.value}
                        helperText={grrerrors[item.name] ? grrerrors[item.name].message : item.description}
                        error={grrerrors[item.name]}
                        />
                        <IconButton aria-label="delete" onClick={()=>remove(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                ))}
                </form>

            <Button variant="contained" color="primary" type='submit' form='thing-form'>
            Save
            </Button>
        </>
    )
}

export default AttributesSchemaEditor