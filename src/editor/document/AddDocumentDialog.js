import { Button, DialogContentText, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useForm } from 'react-hook-form';

const AddDocumentDialog = ({open, handleClose, handleAddNew}) => {
    const { register, handleSubmit, formState:{errors} } = useForm()
    
    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add new document</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the id/key of the new document (or it will be generated for you)
                    </DialogContentText>
                    <form onSubmit={handleSubmit(handleAddNew)}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            type="text"
                            fullWidth
                            required={true}
                            {...register("id")}
                            helperText={errors.id?.message}
                            error={errors.id ? true : false}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit(handleAddNew)} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
    )
}
export default AddDocumentDialog