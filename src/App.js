import React from "react"
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom'
import './App.css';
import './firebase/config'
import "firebase/auth"
import 'firebase/firestore'
import { UserProvider } from './firebase/UserProvider'
import Header from "./Header"
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
import Jira from "./pages/Jira";
import SiteMenu from "./components/SideMenu";
import { makeStyles, CssBaseline } from "@material-ui/core";
import Main from "./components/Main";
import Workspaces from "./pages/Workspaces";
import { WorkspaceProvider } from "./components/WorkspaceProvider";
import { SnackbarProvider } from "notistack";

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));
function App() {
  const classes = useStyles();


  return (

    <BrowserRouter>
      <SnackbarProvider maxSnack={5} anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
          }}>
        <UserProvider>
          <WorkspaceProvider>
            <Header appBar={classes.appBar}></Header>
            <div className={classes.root}>
              <CssBaseline />
              <SiteMenu drawer={classes.drawer} drawerPaper={classes.drawerPaper} toolbar={classes.toolbar}></SiteMenu>
              <Main content={classes.content}>
                <Switch>
                  <Route exact path="/signup" component={Signup} />
                  <Route exact path="/signin" component={Signin} />
                  <Route exact path="/editor" component={Editor} />
                  <Route path="/jira" component={Jira} />
                  <Route exact path="/profile" component={Profile} />
                  <Route path="/workspaces" component={Workspaces} />

                  <Route path="/">
                    <Redirect to="/signin" />
                  </Route>
                </Switch>
              </Main>
            </div>
          </WorkspaceProvider>
        </UserProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;

