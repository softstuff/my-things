import React  from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import { Handle, Position } from 'react-flow-renderer';
import { useEdge } from './useEdge';
import { Box } from '@material-ui/core';
import { useRef } from 'react';


const useStyles = makeStyles((theme) => ({
  paper: {
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));


const ArgumentNode = ({data}) => {
  const {onlySingleEdge} = useEdge()
  const classes = useStyles();
  const boxEl = useRef()
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    // setAnchorEl(event.currentTarget);
    setAnchorEl(boxEl.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;


  return (
    <>
    <Box display='flex' flexDirection="row" ref={boxEl}>
      <Handle type="target" position={Position.Left} isValidConnection={onlySingleEdge}  />
      <Box flexGrow={1}>{data.name}{data.required === 'yes' ? '*':''}</Box>
      <Box>
        <InfoIcon onClick={handleClick} fontSize="small" color="primary" />
      </Box>
    </Box>
    <Popover 
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
 <Typography className={classes.typography}>The content of the Popover.</Typography>
</Popover>
    </>
  );
}

export default ArgumentNode