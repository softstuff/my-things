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

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Container maxWidth="lg">
          <Header></Header>
          <Switch>
            <ProfileRedirect exact path="/signup" component={Signup} />
            <ProfileRedirect exact path="/signin" component={Signin} />
            <Route exact path="/editor" component={Editor} />
            <Route path="/profile" component={Profile} />
            <Route path="/">
              <Redirect to="/signin" />
            </Route>
          </Switch>
        </Container>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

