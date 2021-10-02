import React from "react"
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import './App.css';
import './firebase/config'
import "firebase/auth"
import 'firebase/firestore'
import {UserProvider} from './firebase/UserProvider'
import Header from "./Header"
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Profile from "./pages/Profile";
import Jira from "./pages/Jira";
import LeftSiteMenu from "./components/LeftSideMenu";
import {CssBaseline, makeStyles} from "@material-ui/core";
import Main from "./components/Main";
import Workspaces from "./pages/Workspaces";
import {SnackbarProvider} from "notistack";
import NotFoundPage from "./pages/NotFoundPage";
import Error from "./pages/Error";
import SchemaView from "./pages/SchemaView";
import ImportPage from "./pages/ImportPage";
import {WorkspaceProvider} from "./components/workspace/useWorkspace";
import {ConfirmProvider} from 'material-ui-confirm';
import EditorPage from "./pages/EditorPage";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        // minWidth: '100vw'
    },
    main: {
        display: 'flex',
        height: 'calc(100% - 64px)'
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
        padding: theme.spacing(1),
    },
}));

const theme = createMuiTheme();

function App() {
    const classes = useStyles();


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className={classes.root}>

                <BrowserRouter>

                    <SnackbarProvider maxSnack={5} anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}>
                        <ConfirmProvider>

                            <Switch>
                                <Route path="/signup" component={Signup}/>
                                <Route path="/signin" component={Signin}/>
                                <Route path="/error" component={Error}/>
                                <Route path="/404" component={NotFoundPage}/>
                                <Route>
                                    <UserProvider>
                                        <WorkspaceProvider>

                                            <Header appBar={classes.appBar}></Header>
                                            <div className={classes.main}>

                                                <LeftSiteMenu drawer={classes.drawer} drawerPaper={classes.drawerPaper}
                                                              toolbar={classes.toolbar}></LeftSiteMenu>
                                                <Main content={classes.content}>
                                                    <Switch>
                                                        <Route exact path="/editor" component={EditorPage}/>
                                                        <Route path="/jira" component={Jira}/>
                                                        <Route exact path="/profile" component={Profile}/>
                                                        <Route path="/workspaces" component={Workspaces}/>
                                                        <Route path="/schema" component={SchemaView}/>
                                                        <Route path="/import" component={ImportPage}/>
                                                        <Route path="/">
                                                            <Redirect to="/signin"/>
                                                        </Route>
                                                        <Route path="*" component={NotFoundPage}/>
                                                    </Switch>
                                                </Main>
                                            </div>
                                        </WorkspaceProvider>
                                    </UserProvider>
                                </Route>
                            </Switch>
                        </ConfirmProvider>
                    </SnackbarProvider>
                </BrowserRouter>
            </div>
        </ThemeProvider>
    );
}

export default App;
