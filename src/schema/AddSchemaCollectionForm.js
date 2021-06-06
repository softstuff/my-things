import {Button, Grid, TextField} from "@material-ui/core"
import {useForm} from "react-hook-form"
import SaveAltIcon from '@material-ui/icons/SaveAlt';


const AddSchemaCollectionForm = ({ forbiddenNames, pointer, onNewCollection }) => {
    const { handleSubmit, register, reset, errors } = useForm()

    const onSubmit = data => {
        console.log('onNewCollection', data)
        onNewCollection(pointer, data)
        reset()
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <p>New collection</p>
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
                spacing={2}
            >
                <Grid item xs={12}>
                    <TextField name='key' label="Name" required={true} {...register("key",{
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
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='description'
                        {...register("description")}
                        label='Description' />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type='submit'
                        variant="contained"
                        color="primary"
                        startIcon={<SaveAltIcon />}
                    >
                        Insert
                </Button>
                </Grid>
            </Grid>
        </form>)
}

export default AddSchemaCollectionForm

{/* "minItems": 2,
  "maxItems": 3 */}