import {Backdrop, Button, Card, CardContent, CardHeader, Divider, Grid, makeStyles} from '@material-ui/core'
import React from 'react'
import {auth} from '../firebase/config'
import {useSession} from '../firebase/UserProvider';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    card: {

    },

    box: {
        height: '10rem',
        
      },
    cell: {
        margin: '2rem'
    }
}));

const NewTenant = () => {
    const classes = useStyles();
    const {loadClames} = useSession()


    const handleCreateNewTenant = async () => {
        console.log('Creat new Tenant')
        try {
            const host = process.env.REACT_APP_USE_FIREBASE_EMULATOR ? 'http://localhost:5000' : ''
            console.log("host", host)
            const token = await auth.currentUser.getIdToken()
            const res = await fetch(`${host}/api/tenant`, {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'include', // include, *same-origin, omit
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    redirect: 'follow', // manual, *follow, error
                    referrerPolicy: 'same-origin' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                })
            const json = await res.json()
            console.log('Created tenant', json)

            const loadedClaims = await loadClames(true)
            console.log('Fetched clames',loadedClaims)
            // const tokenResult = await auth.currentUser.getIdTokenResult(true)
            // console.log('Fetched clames', tokenResult, tokenResult.claims)

            if( loadedClaims?.myThings?.tenantId === json.tenantId){
                console.log("Wii User belongs to the tenant")
                // Object.keys(tokenResult.claims).filter( claim => claim.startsWith('x_mt_')).forEach(key => {
                //     newSession.claims[key] = tokenResult.claims[key]
                //     console.log(`Adding app claims ${key} = ${tokenResult.claims[key]}`)
                // });
                // setSession({
                //     ...session,
                //     tenentId: tokenResult.x_mt_tenantId
                // })
            } else {
                console.log("BUU User do not belongs to the tenant, yet")
            }
        } catch(error) {
            console.log("Failed to create teanant", error)
        }
    }

    return (
        <Backdrop className={classes.backdrop} open={true}>
            <Card className={classes.card} raised={true} >
                <CardHeader title='Welcome' />
                <CardContent>
                    <Grid container
                        direction="row"
                        justify="space-between"
                        alignItems="stretch"
                        className={classes.box}>
                        <div className={classes.cell}>
                            <h2>Create a new workspace</h2>
                            <Button variant="contained" color='primary' onClick={handleCreateNewTenant} >Yes</Button>
                        </div>
                        <Divider light={false} orientation="vertical" flexItem ></Divider>
                        <div className={classes.cell}>
                            <h2>Invite to a workspace</h2>
                            <p>Now that you have signed up tell your workspace admin to invite you.</p>
                            You are known as <input type='text' value={auth.currentUser.uid} readOnly/>
                        </div>
                    </Grid>
                </CardContent>
            </Card>
        </Backdrop>
    )
}

export default NewTenant