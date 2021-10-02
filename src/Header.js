import React, {useState} from 'react'
import makeStyles from '@mui/styles/makeStyles';
import {AppBar, Button, IconButton, Menu, MenuItem, Toolbar, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

import {logout} from './firebase/auth'
import {useHistory} from 'react-router-dom'
import {useSession} from './firebase/UserProvider'

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    appBar: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
    },
}));



function Header() {
    const { claims, jira } = useSession()    
    const classes = useStyles();
    
    if (jira) {
        console.log('Hide Header menu on Jira setup')
        return null
    }
    return (
        <div className={classes.root}>
            <AppBar position="static" className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="menu"
                        size="large">
                        <MenuIcon />
                    </IconButton>
                    

                    {!!claims ? (
                        <LoggedInUsersMenu />
                    ) : (
                        <NotLoggedInUsersMenu />    
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
}

function NotLoggedInUsersMenu() {
    return (<Button color="inherit">Login</Button>)
}

function LoggedInUsersMenu() {

    const { claims } = useSession() 
    const history = useHistory()
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const logoutUser = async () => {
        await logout()
        handleClose()
        history.push('/signin')
    }

    const openUserProfile = () => {
        handleClose()
        history.push('/profile')
    }

    const openEditor = () => {
        console.log('open editor')
        history.push('/editor')
    }

    const handleUserMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return <>


        <Typography variant="h6" className={classes.title} onClick={openEditor}>
            Editor
        </Typography>

        <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleUserMenuClick}
            color="inherit"
            size="large">
            <AccountCircle />
            {claims.displayName}
        </IconButton>
        <Menu
            id="user-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem onClick={openUserProfile}>Profile</MenuItem>
            <MenuItem onClick={logoutUser}>Logout</MenuItem>
        </Menu>
    </>;
}

export default Header
