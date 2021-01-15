import React from 'react'
import { Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core'
import InboxIcon from '@material-ui/icons/MoveToInbox';
import AccountCircle from '@material-ui/icons/AccountCircle';
import InfoIcon from '@material-ui/icons/Info';
import InputIcon from '@material-ui/icons/Input';
import ExtensionIcon from '@material-ui/icons/Extension';
import { Link, useHistory } from 'react-router-dom';
import { useWorkspace } from './WorkspaceProvider';

const SiteMenu = (props) => {
  const { workspace } = useWorkspace()
  const history = useHistory()

  const openUserProfile = () => {
    history.push('/profile')
  }

  const openEditor = () => {
    console.log('open editor')
    history.push('/editor')
  }
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
      { workspace && (<List>
        <ListSubheader>
          {`Workspace: ${workspace.id}`}
        </ListSubheader>

        <ListItem button onClick={openEditor}>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary='Editor' />
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
        <ListItem button onClick={openUserProfile}>
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