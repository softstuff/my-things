import React from 'react'
import { Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core'
import InboxIcon from '@material-ui/icons/MoveToInbox';
import AccountCircle from '@material-ui/icons/AccountCircle';
import InfoIcon from '@material-ui/icons/Info';
import InputIcon from '@material-ui/icons/Input';
import ExtensionIcon from '@material-ui/icons/Extension';
import { Link } from 'react-router-dom';
import { useWorkspace } from './workspace/useWorkspace';


const SiteMenu = (props) => {
  const { wid } = useWorkspace()


  // <div className={props.toolbar} />

  return (
    <Drawer
      className={props.drawer}
      variant="permanent"
      classes={{
        paper: props.drawerPaper,
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

        <ListItem button  component={Link} to={`/schema`} >
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary='Schema' />
        </ListItem>
        <ListItem button  component={Link} to={`/editor`} >
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary='Editor' />
        </ListItem>
        <ListItem button  component={Link} to={`/import`}>
          <ListItemIcon>
            <ExtensionIcon />
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

export default SiteMenu