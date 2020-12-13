import React from "react"
import { Route, BrowserRouter, Switch, Redirect } from 'react-router-dom'
import './App.css';
import './firebase/config'
import "firebase/auth"
import 'firebase/firestore'
import Container from '@material-ui/core/Container';
import { UserProvider } from './firebase/UserProvider'
import ProfileRedirect from "./router/ProfileRedirect";
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
import Header from "./Header"
import Jira from "./pages/Jira";

function App() {
  return (
    
    <BrowserRouter>
      <UserProvider>
        <Container maxWidth="lg">
          <Header></Header>
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
        </Container>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;

