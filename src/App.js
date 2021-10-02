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
import CssBaseline from '@mui/material/CssBaseline';
import Main from "./components/Main";
import Workspaces from "./pages/Workspaces";
import {SnackbarProvider} from "notistack";
import NotFoundPage from "./pages/NotFoundPage";
import Error from "./pages/Error";
import SchemaView from "./pages/SchemaView";
import ImportPage from "./pages/ImportPage";
import {WorkspaceProvider} from "./components/workspace/useWorkspace";
import EditorPage from "./pages/EditorPage";
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

const theme = createTheme()

function App() {


    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="root">

                    <BrowserRouter>

                        <SnackbarProvider maxSnack={5} anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}>

                            <Switch>
                                <Route path="/signup" component={Signup}/>
                                <Route path="/signin" component={Signin}/>
                                <Route path="/error" component={Error}/>
                                <Route path="/404" component={NotFoundPage}/>
                                <Route>
                                    <UserProvider>
                                        <WorkspaceProvider>

                                            <Header></Header>
                                            <div className="main">

                                                <LeftSiteMenu></LeftSiteMenu>
                                                <Main>
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
                        </SnackbarProvider>
                    </BrowserRouter>
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
