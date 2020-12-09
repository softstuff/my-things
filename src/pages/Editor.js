import React, { useState, useEffect } from 'react'
import { firestore } from '../firebase/config'
import { Paper, Grid, makeStyles, Breadcrumbs, Link, FormControlLabel, Switch } from '@material-ui/core'
import DocumentView from '../components/DocumentView';
import ThingsBreadcrumbs from '../components/ThingsBreadcrumbs';




const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'left',
        color: theme.palette.text.secondary,

    },

    main: {
        minHeight: '70vh'
    }
}));

function Editor() {

    const classes = useStyles();
    const [path, setPath] = useState(['tenants'])
    const [editing, setEditing] = useState(false)

    const handlePathChange =  (newPath) => {
        setPath(newPath)
    }

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={`${classes.paper}`}>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="flex-start">

                        
                        <ThingsBreadcrumbs 
                            path={path} 
                            onPathChange={handlePathChange}/>
                            

                        <FormControlLabel
                            control={<Switch checked={editing} onChange={ () => setEditing(!editing)} />}
                            label="Edit"
                        />
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={`${classes.paper} ${classes.main}`}>
                        Collection
                        <CollectionList path={path} onPathChange={handlePathChange} />
                    </Paper>
                </Grid>
                <Grid item xs={8}>
                    <Paper className={`${classes.paper} ${classes.main}`}>
                        
                        <DocumentView path={path} onPathChange={handlePathChange}  editing={editing}/>

                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}



function CollectionList({ path, onPathChange }) {
    const [collection, setCollection] = useState({
        keys: []
    })
    const collectionPath = toCollectoinPath(path)
    const dbKey = collectionPath.join('/')

    useEffect(() => {
        const colRef = firestore.collection(dbKey)
        const unsubscribe = colRef.onSnapshot((snapshot) => {

            const metaData = snapshot.docs.find( doc => doc.id == 'meta')
            const data = snapshot.docs.filter(doc => doc.id != 'meta').map((doc) => {
                return doc.id
            })
            setCollection({ 
                meta: metaData,
                keys: data,
            })

        }, (error) => {
            console.log('Error', error)
        })

        return () => unsubscribe()
    }, [dbKey])

    const handleClick = (docName) => {
        onPathChange(collectionPath.concat([docName]))
    }
    return (
        <>
            <Paper>
                
                <h2>{collectionPath[collectionPath.length -1]} ({collection.keys.length})</h2>
                <ol>
                    {collection.keys
                        .filter(name => name != 'meta')
                        .map((key, index) => 
                            <CollectionItem key={index} name={key} onClick={() => handleClick(key)} />)}
                </ol>
            </Paper>
        </>
    )
}

function CollectionItem({ name, onClick }) {

    const handleClick = () => {
        onClick(name)
    }

    return (
        <li onClick={handleClick}>{name}</li>
    )

}

function toCollectoinPath(path) {
    
    if (path.length % 2 === 0) {
        return path.slice(0, path.length - 1)
    } else {
        return path
    }
}

export default Editor