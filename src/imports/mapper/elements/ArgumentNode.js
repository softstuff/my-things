import React, {useRef, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {Handle, Position} from 'react-flow-renderer';
import {useEdge} from './useEdge';
import {Box, Button, TextField} from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  paper: {
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));


const ArgumentNode = ({data}) => {
  const [open, setOpen] = useState(false);
  const {onlySingleEdge} = useEdge()
  const [label, setLabel] = useState(data.label);
  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <>
    <Box display='flex' flexDirection="row" onClick={handleClickOpen}>
      <Handle type="target" position={Position.Left}  isValidConnection={onlySingleEdge}  />
      {/* <Typography className={classes.typography}> */}
        Attribute: {label} {data.required === 'yes' ? '*':''}
      {/* </Typography> */}
      {/* <Box flexGrow={1}>{data.name}{data.required === 'yes' ? '*':''}</Box> */}
      {/* <Box>
        <InfoIcon onClick={handleClick} fontSize="small" color="primary" />
      </Box> */}
    </Box>
    <SimpleDialog label={label} open={open} onClose={handleClose} />

    </>
  );
}

function SimpleDialog({ onClose, label, onNameChange, open }) {
  const classes = useStyles();

  const handleClose = () => {
    onClose(label);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Attribute</DialogTitle>
      <TextField label="Name" value={label} />
      <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
    </Dialog>
  );
}



export default ArgumentNode