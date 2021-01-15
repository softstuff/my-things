//@flow
import { Button, makeStyles, TextField, Typography } from '@material-ui/core'
import React from 'react'
import { useForm } from 'react-hook-form'

const useStyles = makeStyles((theme) => ({
    editRow: {
        width: '80%',
        height: '4rem'
    },
    editField: {
        width: '90%'
    },
    newAttribName: {
        width: '45%'
    },
    newAttribValue: {
        width: '45%'
    }
}));


const CollectionInfo = ({meta, editing, onSave}) => {

    const ui = editing ? (
        <EditMeta meta onSave={onSave} />
    ):(
        <Typography>
            Collection: {meta?.displayName}    
        </Typography>
     )
     
     console.log('CollectionInfo', meta, editing, onSave)

    return (
        <>
            {ui}     
        </>
    )
}


const EditMeta = ({meta, onSave}) => {

    const { register, handleSubmit} = useForm({
        defaultValues: {
            displayName: meta?.displayName
        }
    })
    const classes = useStyles();
  
    return (
        <form onSubmit={handleSubmit(onSave)}>
            <TextField className={classes.displayName} name='displayName' placeholder='Display name' inputRef={register} />

            <Button type="submit">Save</Button>
        </form>
    )
}




export default CollectionInfo