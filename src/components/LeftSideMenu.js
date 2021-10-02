import React from 'react'
import {Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, ListSubheader} from '@mui/material'
import InboxIcon from '@mui/icons-material/MoveToInbox';
import AccountCircle from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import InputIcon from '@mui/icons-material/Input';
import ExtensionIcon from '@mui/icons-material/Extension';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import {Link} from 'react-router-dom';
import {useWorkspace} from './workspace/useWorkspace';
import {makeStyles} from "@mui/styles";

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
}))


const LeftSiteMenu = (props) => {
  const classes = useStyles();
  const { wid } = useWorkspace()


  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >

      <Divider />
      <List>
        <ListItem button component={Link} to={`/workspaces`} >
          <ListItemIcon>
            <InputIcon />
          </ListItemIcon>
          <ListItemText primary='Workspaces' />
        </ListItem>
      </List>
      <Divider />
      { wid && (<List>
        <ListSubheader>
          {`Workspace: ${wid}`}
        </ListSubheader>

        {/* <ListItem button  component={Link} to={`/schema`} >
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary='Schema' />
        </ListItem> */}
        <ListItem button  component={Link} to={`/editor`} >
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary='Editor' />
        </ListItem>
        <ListItem button  component={Link} to={`/import`}>
          <ListItemIcon>
            <AssignmentReturnedIcon />
          </ListItemIcon>
          <ListItemText primary='Import' />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <ListItemText primary='Assets' />
        </ListItem>
      </List>)}
      <Divider />
      <List>
        <ListItem button component={Link} to={`/profile`} >
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary='Profile' />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary='About' />
        </ListItem>
      </List>
      <Divider />
    </Drawer>
  )
}

export default LeftSiteMenu