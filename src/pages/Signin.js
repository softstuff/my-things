import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { signin, signup } from "../firebase/auth"
import { Container, Card, CardHeader, CircularProgress, TextField, Button, Box, makeStyles, CardContent } from "@material-ui/core"
import { useHistory } from "react-router-dom";


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.default
    },
    card: {

    },
    box: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch"
    },
    login: {
        flex: "1 0 10rem",
        display: "flex",
        flexWrap: "wrap"
        //   fontSize: theme.typography.pxToRem(15),
        //   flexBasis: '33.33%',
        //   flexShrink: 0,
    },
    space: {
        flex: "0 0 2rem"
    },
    social: {
        flex: "1 0 10rem",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "flex-start"

        //   fontSize: theme.typography.pxToRem(15),
        //   color: theme.palette.text.secondary,
    },
    signup: {
        flex: "1 0 15rem",
    },
    item: {
        flex: "1 0 15rem",
        paddingBottom: '1em'
    },
    or: {
        paddingTop: '1em',
        textAlign: "center"
    },
    btnGoogle: {
        backgroundColor: 'white'
    }
}));

function Signin(props) {
    const classes = useStyles();
    let history = useHistory();
    const { register, handleSubmit, reset } = useForm()
    const [isLoading, setLoading] = useState(false)
    const [signUp, setSignUp] = useState(false)
    const [error, setError] = useState(false)

    const onSignInSubmit = async (data) => {
        let user
        setLoading(true)

        try {
            console.log("onSignInSubmit", data)
            user = await signin(data)
            console.log("signed in user is", user, user.uid)
            reset()
        } catch (error) {
            console.log("onSubmit, error", error)
        }
        if (user) {
            history.push(`/editor`)
        } else {
            setLoading(false)
        }
    }
    const onSignUpSubmit = async data => {
        let newUser
        setLoading(true)

        try {
            console.log("onSignUpSubmit", data)
            newUser = await signup(data)
            console.log("new user is", newUser, newUser.uid)
            reset()
            history.push(`/editor`)
        } catch (error) {
            console.log("onSubmit, error", error)
            setError(error.message || error)
            setLoading(false)
        }
    }
    return (
        <div bgcolor="background.paper">
            <Container className={classes.container} maxWidth="sm"  >
                <Card className={classes.card}>
                    <CardHeader title='Sign in' />

                    <CardContent>
                        {isLoading && <CircularProgress />}

                        <Box className={classes.box}>
                            {!signUp && (
                                <form onSubmit={handleSubmit(onSignInSubmit)} className={classes.login}>
                                    <h3 className={classes.item}>with password</h3>
                                    <TextField className={classes.item} required name="email" label="Email adress" inputRef={register} />
                                    <TextField className={classes.item} required name="password" label="Password" inputRef={register} />
                                    {error && (<Box color="error.main">{error}</Box>)}
                                    <Button className={classes.item} variant="contained" color="primary" type='submit'>
                                        Sign in
                                </Button>
                                    <div className={`${classes.item} ${classes.or}`}>
                                        OR
                                </div>
                                    <Button className={classes.item} variant="contained" color="secondary" onClick={() => setSignUp(true)}>
                                        Sign up
                                </Button>
                                </form>
                            )}
                            {signUp && (
                                <form onSubmit={handleSubmit(onSignUpSubmit)} className={classes.login}>
                                    <h3 className={classes.item}>with password</h3>
                                    <TextField className={classes.item} required name="firstName" label="First name" inputRef={register} />
                                    <TextField className={classes.item} required name="lastName" label="Last name" inputRef={register} />
                                    <TextField className={classes.item} required name="email" label="Email adress" inputRef={register} />
                                    <TextField className={classes.item} required name="password" label="Password" inputRef={register} />
                                    {error && (<Box color="error.main">{error}</Box>)}
                                    <Button className={classes.item} variant="contained" color="primary" type='submit'>
                                        Sign up
                                </Button>
                                    <div className={classes.item}>OR</div>

                                    <Button className={classes.item} variant="contained" color="secondary" onClick={() => setSignUp(false)}>
                                        Sign in
                                </Button>
                                </form>
                            )}
                            <div className={classes.space}>
                            </div>
                            <Box className={classes.social}>
                                <h3 className={classes.item}>with other account</h3>
                                <Button className={`${classes.item} ${classes.btnGoogle}`} variant="contained">
                                    Google
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>


                </Card>
            </Container>
        </div>

    )
}

export default Signin