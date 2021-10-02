import React from 'react'
import {makeStyles} from "@mui/styles";

const useStyles = makeStyles((theme) => ({
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1),
    },
}))

const Main = (props) => {
    const classes = useStyles();
    
    return (
        <main className={classes.content}>
            {props.children}
        </main>
    )
}

export default Main