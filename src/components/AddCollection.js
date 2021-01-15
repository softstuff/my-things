// @flow
import { Icon, IconButton, TextField } from '@material-ui/core'
import React from 'react'
import { useForm } from 'react-hook-form'

const AddCollection = ( { onAdd, forbiddenNames }) => {

    const { register, handleSubmit, reset, errors} = useForm()
    
    const onSubmit = (data) => {
        try {
            console.log("onSubmit", data.name)
            onAdd(data)
            reset()
            
        } catch(error) {
            console.log("onAddCollection, error", error, data.newCollection)
        }
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}> 
            <TextField name='displayName' label="New collection" required='true' inputRef={register({
                required: 'You forgot to name your new collection',
                validate: value => {
                        console.log('validate ', value, forbiddenNames )
                        
                        if(forbiddenNames) {
                            return !forbiddenNames.some( child => value === child ) || 'Collection name must be uniqe'
                        }
                        return true
                    }
                })}
                helperText={errors.name?.message}
                error={ errors.name ? true : false }/>
             <TextField name='id' label="Collection id" inputRef={register} />
            <IconButton aria-label="add" type='submit'>
                <Icon>add_circle</Icon>
            </IconButton>
        </form>
    )
}

export default AddCollection