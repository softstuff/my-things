import { Button, Icon, IconButton, makeStyles, TextField } from '@material-ui/core';
import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form';
import DeleteIcon from '@material-ui/icons/Delete';

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


const AttributesManualEditor = ({create, doc, onSaveThing}) => {
    const classes = useStyles();
    const { register, handleSubmit, control} = useForm()
    const { register: registerAddAttribute, handleSubmit: handleSubmitAddAttribute, reset: resetAddAttribute, errors} = useForm()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "thing", 
    });

    useEffect(() => {
        remove()
        console.log('AttributesManualEditor - Init ', doc)
        doc?.thing && Object.keys(doc.thing).forEach(attribute => {
            append({name: attribute, value: doc.thing[attribute]})
        })
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doc])
    
    const handleSave = (thing) => {
        console.log('handleSave', thing)
        onSaveThing(thing)
    }
   
    const onAddNewAttribute = (data) => {
        console.log(`Add attribute ${data.name}: ${data.value}`)
        append({name: data.name, value: data.value})
        resetAddAttribute()
    }
    
    return (
        <>
            <form id='thing-form' onSubmit={handleSubmit(handleSave)}>
                {create && (
                    <TextField className={classes.editField} label='id' name='id' inputRef={register}/>                
                )}
                <h2>Attributes</h2>
                {fields.map((item, index) => (
                    <div className={classes.editRow} key={item.id}>
                        <TextField className={classes.editField} 
                        required
                        name={item.name}
                        label={item.name}
                        inputRef={register()}
                        defaultValue={item.value}/>
                        <IconButton aria-label="delete" onClick={()=>remove(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                ))}
                </form>


                
            <form onSubmit={handleSubmitAddAttribute(onAddNewAttribute)}>
                <div className={classes.editRow}>
                    <TextField className={classes.newAttribName} placeholder='Name' name='name' inputRef={registerAddAttribute({
                        required: 'Attribute name is required',
                        validate: value => {
                            console.log('validate ', value, doc.thing[value] )
                            return !doc.thing[value] || 'Attribute name must be uniqe'
                        }
                    })}
                    helperText={errors.name?.message}
                    error={ errors.name ? true : false }
                    />
                    <TextField className={classes.newAttribValue} placeholder='Value' name='value' inputRef={registerAddAttribute}/>
                    <IconButton aria-label="add" type='submit'>
                        <Icon>add_circle</Icon>
                    </IconButton>
                </div>
            </form>

            <Button variant="contained" color="primary" type='submit' form='thing-form'>
            Save
            </Button>
        </>
    )
}

export default AttributesManualEditor