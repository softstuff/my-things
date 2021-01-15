import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import React from 'react'
import DeleteIcon from '@material-ui/icons/Delete';



const CollectionList = ({collections, selected, onCollectionSelected, editing, onDelete}) => {


    return (
        <>
            <p>CollectionList</p>
            <List>
            {collections.map( collectionId => 
                 <ListItem key={collectionId} selected={selected === collectionId}>
                    <ListItemText primary={collectionId} onClick={()=>onCollectionSelected(collectionId)} />
                    {editing && 
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={()=>onDelete(collectionId)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                    }
                </ListItem>
            )}
            </List>
        </>
    )
}


export default CollectionList