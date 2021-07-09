import {Button, makeStyles, TextField} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {useSchema} from "./useSchema";


const useRawEditorStyles = makeStyles({
    editRow: {
        width: '100%',
    },
    editField: {
        width: '100%',
    },
});

const RawEditor = () => {
    const classes = useRawEditorStyles();
    const { register, handleSubmit, setValue } = useForm()
    const { enqueueSnackbar } = useSnackbar();
    const {schema, save} = useSchema()

    useEffect(() => {

        setValue('raw', JSON.stringify(schema, null, 2), {
            shouldValidate: true,
            shouldDirty: true
        })
    }, [schema, setValue])

    const onSave = data => {
        const schemaToSave = JSON.parse(data.raw)
        console.log("Saving ", schemaToSave)
        try {

            save(schemaToSave)
            enqueueSnackbar('Saved schema', { variant: 'success' })
        } catch (error) {
            console.log('Failed to save schema', error)
            enqueueSnackbar(`Failed to save schema ${error}`, { variant: 'error' })
        }
    }


    return (
        <form onSubmit={handleSubmit(onSave)} >
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

export default RawEditor


// {
//     "properties": {
//       "Skola": {
//         "type": "array",
//         "items": {
//             "type": "object",
//             "properties": {
//                 "Klass": {
//                     "type": "array"
//                 }
//             }
//         }
//       }
//     }
//   }
