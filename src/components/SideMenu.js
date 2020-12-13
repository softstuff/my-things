import React from 'react'
import { Drawer, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import InboxIcon from '@material-ui/icons/MoveToInbox';
import AccountCircle from '@material-ui/icons/AccountCircle';
import InfoIcon from '@material-ui/icons/Info';
import ExtensionIcon from '@material-ui/icons/Extension';
import { useHistory } from 'react-router-dom';

const SiteMenu = (props) => {

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
      </List>
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