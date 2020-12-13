import React from "react"
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom'
import './App.css';
import './firebase/config'
import "firebase/auth"
import 'firebase/firestore'
import { UserProvider } from './firebase/UserProvider'
import ProfileRedirect from "./router/ProfileRedirect";
import Header from "./Header"
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
import Jira from "./pages/Jira";
import SiteMenu from "./components/SideMenu";
import { makeStyles, CssBaseline } from "@material-ui/core";
import Main from "./components/Main";

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
      <UserProvider>
        <Header appBar={classes.appBar}></Header>
        <div className={classes.root}>
          <CssBaseline />
          <SiteMenu drawer={classes.drawer} drawerPaper={classes.drawerPaper} toolbar={classes.toolbar}></SiteMenu>
          <Main content={classes.content}>
            <Switch>
              <ProfileRedirect exact path="/signup" component={Signup} />
              <ProfileRedirect exact path="/signin" component={Signin} />
              <Route exact path="/editor" component={Editor} />
              <Route path="/jira" component={Jira} />
              <Route path="/profile" component={Profile} />
              <Route path="/">
                <Redirect to="/signin" />
              </Route>
            </Switch>
          </Main>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;

