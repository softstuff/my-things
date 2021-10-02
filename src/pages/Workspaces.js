//@flow
import React, {useEffect, useState} from 'react'
import makeStyles from '@mui/styles/makeStyles';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import {createWorkspace, getWorkspaces, removeWorkspace, updateWorkspace} from '../firebase/storage'
import { AccordionActions, Button, Divider, TextField } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {useSession} from '../firebase/UserProvider';
import {Link} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {useWorkspace} from '../components/workspace/useWorkspace';


const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    addIcon: {
      position: 'fixed',
      right: '5vw',
      bottom: '5vh'
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    actions: {
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }));

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
          size="large">
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const Workspaces = () => {
    const classes = useStyles();
    const { claims } = useSession()
    const { workspace, setWid } = useWorkspace()
    const [ workspaces, setWorkspaces ] = useState([])
    const tenantId = claims.myThings.tenantId
    const [expanded, setExpanded] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState();
    const [editWs, setEditWs] = React.useState();
    const [empty, setEmpty] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    useEffect(()=>{

        const onLoaded = (workspaces) => {
            console.log(`Loaded workspaces for tenant ${tenantId}`, workspaces)
            setWorkspaces(()=> workspaces)
            setEmpty(workspaces.length === 0)
           
        }

        const onError = (error) => {
            console.log(`Failed to load workspaces`, error)
            setWorkspaces([])
        }
        const unsubscribe = getWorkspaces(tenantId, onLoaded, onError)
        return unsubscribe
    },[tenantId])

    const handleSavedWorkspace = () => {
      setEditWs();
    };
    const popDeleteWorkspaceConfirmDialog = async (wid) => {
      setConfirmDelete(wid)
      
    }

    const handleDeleteWorkspace = async (wid) => {
      if (wid) {
        console.log('Clear to remove workspace', wid)
        await removeWorkspace(claims.myThings.tenantId, wid)
        if(workspace?.id === wid) {
          setWid()
        }
      } else {
        console.log('Cancel removal of workspace', wid)
      }
      setConfirmDelete()
    }
    const handleEditDialogClose = (wid) => {
      setOpen(false)
      setEditWs()
      setExpanded(wid)
    }
    const openEditDialog = (ws) => {
      setEditWs(ws)
      setOpen(true)      
    }

    const workspaceUI = workspaces.map(ws => (
        <Accordion key={ws.id} expanded={expanded === ws.id} onChange={handleChange(ws.id)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${ws.id}bh-content`}
          id={`${ws.id}bh-header`}
        >
          <Typography className={classes.heading}>{ws.id}</Typography>
          {/* <Typography className={classes.secondaryHeading}>I am an accordion</Typography> */}
          <Button size="small" color="secondary" onClick={()=>setWid(ws.id)}>Use</Button>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {ws.description}
          </Typography>
        </AccordionDetails>
        <Divider />
        <AccordionActions className={classes.actions} >
          <Divider orientation="vertical" flexItem />
          <Button size="small" color="secondary" onClick={()=>{}}>Backup</Button>
          <Button size="small" color="secondary" onClick={()=>{}}>Restore</Button>
          <Button size="small" color="secondary" onClick={()=>{}}>Logs</Button>

          <Divider orientation="vertical" flexItem />

          <Button size="small" color="secondary" onClick={()=>popDeleteWorkspaceConfirmDialog(ws.id)}>Delete</Button>
          <Button size="small" color="secondary" onClick={()=>openEditDialog(ws)}>Edit</Button>
          <Button size="small" color="secondary" onClick={()=>{}}>Clone</Button>

          <Divider orientation="vertical" flexItem />
          
          <Button size="small" color="secondary" onClick={()=>setWid(ws.id)}>Use</Button>
          <Button size="small" color="primary" component={Link} to={`/editor`} onClick={()=>setWid(ws.id)}>Editor</Button>
          
          <Divider orientation="vertical" flexItem />
          <ConfirmDeleteDialog open={confirmDelete === ws.id} onClose={handleDeleteWorkspace} workspace={ws} />
        </AccordionActions>
      </Accordion>
    ))

    

    return (
        <div className={classes.root}>
            {workspaceUI}
            {empty && (<Typography>Create a workspace, (+) down to the right</Typography>)}
            <Fab className={classes.addIcon} color="primary" aria-label="add" onClick={()=>openEditDialog()}>
              <AddIcon />
            </Fab>
            <EditDialog edit={editWs} open={open} onClose={handleEditDialogClose} onSaved={handleSavedWorkspace} />
            
        </div>
      );
}

const useDialogStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    flex: "1 0 15rem",
  }
}))
const EditDialog = (props) => {
  const dialogClasses = useDialogStyles();
  const { register, handleSubmit} = useForm()
  const { claims } = useSession()

  const handleClose = () => {
    props.onClose();
  };

  const isNew = !props.edit?.id
  const header = isNew ? 'Add workspace' : 'Edit workspace'
  const submitText = isNew ? 'Create' : 'Update'

  const onSubmit = async ({title, description}) => {
    try {
      if(isNew) {
        console.log('Submit new')
        const newId = await createWorkspace(claims.myThings.tenantId, title, description)
        console.log("Create new workspace ", title, description)
        
        props.onSaved(newId);
      } else {
        console.log('Submit update')
        await updateWorkspace(claims.myThings.tenantId, props.edit.id, description)
        console.log("Update workspace " ,props.edit.id, description)
        
        props.onSaved(props.wid);
      }
      props.onClose();
    } catch(error) {
      console.log(error)
    }
  }
  return (
    <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={props.open}>
    <DialogTitle id="customized-dialog-title" onClose={handleClose}>
      {header}
    </DialogTitle>
    <DialogContent dividers>
      <form onSubmit={handleSubmit(onSubmit)} className={dialogClasses.form}>
        <TextField className={dialogClasses.item} required  name="title" label="Title" defaultValue={props.edit?.title} {...register("title")} />
        <TextField className={dialogClasses.item} multiline={true} rows={3} name="description" label="Description" defaultValue={props.edit?.description} {...register("description")} />
      </form>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={handleSubmit(onSubmit)} color="primary">
        {submitText}
      </Button>
    </DialogActions>
  </Dialog>
  )
}

const ConfirmDeleteDialog = (props) => {
  const { onClose, open, workspace, ...other } = props;


  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(workspace.id);
  };

  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      {...other}>
      <DialogTitle id="confirmation-dialog-title">Delete workspace '{workspace.title}?</DialogTitle>
      <DialogContent dividers>
        
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default Workspaces