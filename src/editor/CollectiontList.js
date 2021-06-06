import {Box, Card, CardHeader, Fab, makeStyles} from '@material-ui/core';
import React, {useState} from 'react'
import {useEditor} from './useEditor';
import {useWorkspace} from '../components/workspace/useWorkspace';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {addNewCollection} from '../firebase/storage'
import {useForm} from 'react-hook-form';

const useStyles = makeStyles((theme) => ({
    card: {
        margin: "1rem",
        minWidth: "10rem",
    },
    add: {
        margin: "1rem",
        marginTop: "1.2rem"
    },
    container: {
        height: 'calc(100% - 28px)',
        // display: 'flex',
        // flexDirection: 'column',
        // justifyContent: 'space-between'

    },
    addCollection: {
        // alignSelf: 'flex-end',
        // margin: '2rem'

    },
    fab: {
        position: 'absolute',
        right: theme.spacing(8),
        bottom: theme.spacing(8)
    }
}));

const CollectionList = ({selected, onCollectionSelected}) => {
    const classes = useStyles();
    const {workspace} = useWorkspace()
    const {setCollectionId, editing} = useEditor()
    
    return (
        <>
            <h2>CollectionList</h2>
            {/*<div className={classes.container}>*/}

                <Box display="flex" flexWrap="wrap">
                    {workspace.collections?.map(collectionId =>
                        <Card key={collectionId} className={classes.card} onClick={() => setCollectionId(collectionId)}>
                            <CardHeader title={collectionId}></CardHeader>
                        </Card>
                    )}
                </Box>

            {/*</div>*/}
            {editing && <div className={classes.addCollection}>
                <AddCollection/>
            </div>}

        </>
    )
}

const AddCollection = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const {setCollectionId, collectionList} = useEditor()
    const {tenantId, wid} = useWorkspace()
    const {register, handleSubmit, errors} = useForm()

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddNew = async (data) => {
        console.log("handleAddNew: ", data)
        await addNewCollection(tenantId, wid, data.name)
        setCollectionId(data.name)
        setOpen(false);
    };

    return (
        <>
            <Fab color="primary" aria-label="add" className={classes.fab} onClick={handleClickOpen}>
                <AddIcon/>
            </Fab>

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add new collection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the name of the new collection
                    </DialogContentText>
                    <form onSubmit={handleSubmit(handleAddNew)}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            type="text"
                            fullWidth
                            required={true}
                            {...register("name",{
                                required: 'You forgot to name your new collection',
                                validate: value => {
                                    console.log('validate ', value, collectionList)

                                    if (collectionList) {
                                        return !collectionList.some(colId => value.toLowerCase() === colId.toLowerCase()) || 'Collection name is already taken'
                                    }
                                    return true
                                }
                            })}
                            helperText={errors?.name?.message}
                            error={errors?.name ? true : false}
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
        </>
    )

}


export default CollectionList