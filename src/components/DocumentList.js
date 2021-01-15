import { List, ListItem, ListItemText } from '@material-ui/core';
import React from 'react'

const DocumentList = ({selected, documentList, onDocumentSelect}) => {
    return (
        <>
            <p>DocumentList</p>
            <List>
            {documentList.map( documentId => 
                 <ListItem key={documentId} selected={selected === documentId}>
                    <ListItemText primary={documentId} onClick={()=>onDocumentSelect(documentId)} />
                </ListItem>
            )}
            </List>
        </>
    )
}


export default DocumentList