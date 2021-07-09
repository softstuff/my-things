//@flow
import {Button, makeStyles, TextField, Typography} from '@material-ui/core'
import React from 'react'
import {useForm} from 'react-hook-form'
import {useEditor} from "../useEditor";

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


const CollectionInfo = () => {

    const {editing, collectionId} = useEditor()
    const ui = editing ? (
        <EditMeta meta  />
    ):(
        <Typography>
            Collection: {collectionId}
        </Typography>
     )
     
     console.log('CollectionInfo', collectionId)

    return (
        <>
            {ui}


            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
            <p>XXX</p>
        </>
    )
}


const EditMeta = ({collectionId, onSave}) => {

    const { register, handleSubmit} = useForm({
        defaultValues: {
            displayName: collectionId
        }
    })
    const classes = useStyles();
  
    return (
        <form onSubmit={handleSubmit(onSave)}>
            <TextField className={classes.displayName} name='displayName' placeholder='Display name' {...register("displayName")} />

            <Button type="submit">Save</Button>
        </form>
    )
}




export default CollectionInfo