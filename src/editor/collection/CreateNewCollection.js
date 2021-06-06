//@flow
import {Button, makeStyles, TextField} from '@material-ui/core'
import React from 'react'
import {useForm} from 'react-hook-form'

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    formControl: {
        width: '100%',
        marginTop: '1em'
    },
}));


const CreateNewCollection = ({onCreate}) => {
    const { register, handleSubmit, errors} = useForm()
    const classes = useStyles();
  
    return (

        <>
            <h1>Create a collection</h1>
            <form className={classes.container} onSubmit={handleSubmit(onCreate)}>
                <TextField className={classes.formControl}
                    name='id'
                    label="Collection key"
                    required={true}
                    {...register("id",{
                        required: 'You forgot set a key for your new collection'})
                    }
                    helperText={errors.id?.message || 'This can NOT be changed later'}
                    error={ errors.id ? true : false } />

                <TextField 
                    className={classes.formControl} 
                    name='displayName'
                    label="Display name"
                    required={true}
                    {...register("displayName",{
                        required: 'You forgot to name your new collection'})
                    }
                    helperText={errors.displayName?.message || 'This can be changed later'}
                    error={ errors.displayName ? true : false }/>
                
                <Button className={classes.formControl} type="submit" variant="contained" color="primary">Create</Button>
            </form>
        </>
    )
}

export default CreateNewCollection