import { Grid, ListItem, ListItemText, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react'


const useStyles = makeStyles((theme) => ({
    editRow: {
        width: '80%',
        height: '4rem'
    },
    editField: {
        width: '90%'
    },
    newAttribName: {
        width: '45%'
    },
    newAttribValue: {
        width: '45%'
    }
}));

const DocumentView2 = ({editing, document}) => {
    const classes = useStyles();

    useEffect(()=>{
        console.log('DocumentView2', document)
    }, [document])
    

    const handleClick = (subCollectionName) => {
        // const newPath = path.concat(subCollectionName)
        // console.log('newPath', newPath, subCollectionName)
        // onPathChange(newPath)
        console.log('TODO load sub collection', subCollectionName)
    }

    return (
        <>
            <Grid container spacing={3}>
                    <Grid item xs={12}>
                        Document
                        <h2>{document.id}</h2>
                    </Grid>

                    { editing ? (
                        <Grid item xs={10}>
                            <h2>Attributes</h2>
                            {/* <EditAttributes doc={doc} dbKey={dbKey}></EditAttributes> */}
                            <h2>Collections</h2>
                            {/* <EditDocChildren doc={doc} dbKey={dbKey}></EditDocChildren> */}
                        </Grid>
                    ) : (
                        <Grid item xs={10}>
                            <h2>Attributes</h2>
                            <pre>{JSON.stringify(document?.thing)}</pre>
                            <h2>Collections</h2>
                            {document?.meta?.children && document.meta.children.map((name, index) => 
                                <ListItem key={index}>
                                    <ListItemText primary={name} onClick={()=>handleClick(name)} />
                                </ListItem>
                            )}
                        </Grid>
                        )}
                </Grid>
        </>
    )
}


export default DocumentView2