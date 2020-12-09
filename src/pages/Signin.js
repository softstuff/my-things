import React, { useState }from "react"
import {Link} from 'react-router-dom'
import {useForm} from "react-hook-form"
import {  signin } from "../firebase/auth"
import { Container, Card, CardHeader, CircularProgress, Grid, TextField, Button, Divider } from "@material-ui/core"

 function Signin(props) {
     const { register, handleSubmit, reset} = useForm()
     const [ isLoading, setLoading] = useState(false)

     const onSubmit = data => {
         let user
         setLoading(true)
         
         try {
            console.log("onSubmit", data)
            user = signin(data)
            console.log("signed in user is", user, user.uid)
            reset()
         } catch(error) {
            console.log("onSubmit, error", error)
         }
         if (user) {
             props.history.push(`/profile`)
         } else {
            setLoading(false)
         }
     }
    return (
        <Container maxWidth="xs">
            <Card>
                <CardHeader title='Sign in' />
                <form onSubmit={handleSubmit(onSubmit)} >
                    {isLoading && <CircularProgress />}

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField required name="email" label="Email adress" inputRef={register} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required name="password" label="Password" inputRef={register} />
                        </Grid>
                        <Button variant="contained" color="primary" type='submit'>
                            Sign in
                        </Button>
                    </Grid>

                </form>

                <Divider orientation="vertical"  title='OR' />
        OR
        <Link to="signin" >Signup</Link>
            </Card>
        </Container>
        
    )
}

export default Signin