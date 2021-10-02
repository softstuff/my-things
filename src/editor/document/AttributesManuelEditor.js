import { Button, Icon, IconButton, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, {useEffect} from 'react'
import {useFieldArray, useForm} from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import {useEditor} from '../useEditor';

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


const AttributesManualEditor = ({onSaveThing}) => {
    const classes = useStyles();
    const { document, createDocument} = useEditor()
    const { register, handleSubmit, control} = useForm()
    const { register: registerAddAttribute, handleSubmit: handleSubmitAddAttribute, reset: resetAddAttribute, formState: { errors}} = useForm()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "thing", 
    });

    useEffect(() => {
        remove()
        console.log('AttributesManualEditor - Init ', document)
        !createDocument && Object.getOwnPropertyNames(document).filter(attrb => attrb !== "id").forEach(attribute => {
            append({name: attribute, value: document[attribute]})
        })
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createDocument, document])
    

    const onAddNewAttribute = (data) => {
        console.log(`Add attribute ${data.name}: ${data.value}`)
        append({name: data.name, value: data.value})
        resetAddAttribute()
    }
    
    return <>
        <form id='thing-form' onSubmit={handleSubmit(onSaveThing)}>
            {createDocument && (
                <TextField className={classes.editField} label='id' name='id' {...register("id")}/>                
            )}
            <h2>Attributes</h2>
            {fields.map((item, index) => (
                <div className={classes.editRow} key={item.id}>
                    <TextField className={classes.editField} 
                    required
                    name={item.name}
                    label={item.name}
                    {...register()}
                    defaultValue={item.value}/>
                    <IconButton aria-label="delete" onClick={()=>remove(index)} size="large">
                        <DeleteIcon />
                    </IconButton>
                </div>
            ))}
            </form>

            <TextField className={classes.newAttribName} placeholder='Name' name='name' {...registerAddAttribute("name",{
                    required: 'Attribute name is required',
                    validate: value => {
                        console.log('validate ', value, document[value] )
                        return !document[value] || 'Attribute name must be uniqe'
                    }
                })}
                helperText={errors.name?.message}
                error={ errors.name ? true : false }
                />

            
        <form onSubmit={handleSubmitAddAttribute(onAddNewAttribute)}>
            <div className={classes.editRow}>
                <TextField className={classes.newAttribName} placeholder='Name' name='name' {...registerAddAttribute("name",{
                    required: 'Attribute name is required',
                    validate: value => {
                        console.log('validate ', value, document[value] )
                        return !document[value] || 'Attribute name must be uniqe'
                    }
                })}
                helperText={errors.name?.message}
                error={ errors.name ? true : false }
                />
                <TextField className={classes.newAttribValue} placeholder='Value' name='value' {...registerAddAttribute("value")}/>
                <IconButton aria-label="add" type='submit' size="large">
                    <Icon>add_circle</Icon>
                </IconButton>
            </div>
        </form>

        <Button variant="contained" color="primary" type='submit' form='thing-form'>
        Save
        </Button>
    </>;
}

export default AttributesManualEditor