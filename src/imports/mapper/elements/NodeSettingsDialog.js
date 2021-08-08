import { Button, Dialog, DialogContent, DialogTitle, DialogActions, makeStyles, Typography } from "@material-ui/core";
import SettingsIcon from '@material-ui/icons/Settings';
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMapper } from "../useMapper";


const useStyles = makeStyles((theme) => ({
    paper: {
      border: '1px solid',
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: "space-between",
      width: "100%",
    },
    settingsItem: {
      flexGrow: 0
    }
  }));

export const NodeSettingsDialog = ({ title, open, onCancel, onSave, children}) => {
    const methods = useForm()
  
    const handleSave = (data) => {
        onSave(data);
    };
  
    const handleClose = () => {
      if(!methods.formState.isDirty){
        onCancel();
      }
    };
    const handleCancel = () => {
      onCancel();
    };
  
    const blockSubmit = (e) => {
      e.preventDefault()
    };
    return (
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <form onSubmit={blockSubmit}>
        <DialogTitle id="node-dialog-title">{title}</DialogTitle>
        <DialogContent>
            <FormProvider {...methods} >
                {children}
            </FormProvider>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={methods.handleSubmit(handleSave)} color="primary">
              Save
            </Button>
          </DialogActions>
          </form>
      </Dialog>
    );
  }

export const NodeSettings = ({nodeId, title, children}) =>  {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const {elements, setElements, locked} = useMapper()
    
    const handleOpenSettings = () => {
        setOpen(true);
      };
    
    const handleSave = (data) => {
    // console.log("Save node data", data, "to node", props.id)
    setElements(
        elements.map(el=> {
        if (el.id === nodeId) {
            el.data = data;
        }
        return el
        })
    )
    setOpen(false);
    };

    const handleClose = () => {
    setOpen(false);
    };

    return (
        <>
            <div className={classes.header}>
                <Typography variant="subtitle2" >{title}</Typography>
                {!locked && (
                <div className={classes.settingsItem}>
                    <SettingsIcon onClick={handleOpenSettings} fontSize="small" color="primary" />
                </div>)}
            </div>
            <NodeSettingsDialog nodeId={nodeId} title={title} open={open} onCancel={handleClose} onSave={handleSave} >
                {children}
            </NodeSettingsDialog>
       </>
    )
}