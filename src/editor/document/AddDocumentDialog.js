import { Button, DialogContentText, TextField } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
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