import React, {useState} from "react"
import {Link} from 'react-router-dom'
import {useForm} from "react-hook-form"
import {signup} from "../firebase/auth"
import Grid from '@material-ui/core/Grid';
import {Button, Card, CardHeader, CircularProgress, Container, Divider, TextField} from "@material-ui/core";

function Signup(props) {
    const { register, handleSubmit, reset } = useForm()
    const [isLoading, setLoading] = useState(false)

    const onSubmit = data => {
        let newUser
        setLoading(true)

        try {
            console.log("onSubmit", data)
            newUser = signup(data)
            console.log("new user is", newUser, newUser.uid)
            reset()
        } catch (error) {
            console.log("onSubmit, error", error)
        }
        if (newUser) {
            props.history.push(`/profile`)
        } else {
            setLoading(false)
        }
    }
    return (
        <div>
            <Container maxWidth="xs">
                <Card>
                    <CardHeader title='Signup' />
                    <form onSubmit={handleSubmit(onSubmit)} >
                        {isLoading && <CircularProgress />}

                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField required  name="firstName" label="First name" {...register("firstName")} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField required name="lastName" label="Last name" {...register("lastName")} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField required name="email" label="Email adress" {...register("email")} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField required name="password" label="Password" {...register("password")} />
                            </Grid>
                            <Button variant="contained" color="primary" type='submit'>
                                Sign up
                                </Button>
                        </Grid>

                    </form>

                    <Divider orientation="vertical"  title='OR' />
            OR
            <Link to="signin" >Signin</Link>
                </Card>
            </Container>
        </div>
    )
}

export default Signup