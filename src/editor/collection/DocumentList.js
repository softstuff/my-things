import {useSnackbar} from 'notistack';
import React, { useEffect, useState} from 'react'
import {useWorkspace} from '../../components/workspace/useWorkspace';
import {useUser} from '../../components/user/useUser'
import {listDocuments} from '../../firebase/storage';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {useEditor} from '../useEditor';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});


const DocumentList = () => {

    const { collectionId, setDocumentId, setDocument } = useEditor()
    const [documentList, setDocumentList] = useState([])
    const [headers, setHeaders] = useState([])
    

    const { enqueueSnackbar } = useSnackbar();
    const { wid } = useWorkspace()
    const { tenantId } = useUser()
    const classes = useStyles();
    
    useEffect(() => {
        let mounted = true
        console.log("List was mounted")
        console.log(' document list load for collectionId:', collectionId)
        return listDocuments(tenantId, wid, collectionId,
            (entitys) => {
                if(!mounted){
                    console.log("Load was aborted")
                    return
                }
                console.log("Loaded", entitys)
                const _headers = [...new Set(entitys.flatMap(entity => Object.keys(entity.doc)))]
                const _docs = entitys

                console.log("Loaded list documents", _docs, _headers)
                setDocumentList(_docs)
                setHeaders(_headers)
            }, (error) => {
                console.log(`Failed to load documents for `, collectionId, error)
                if(!mounted){
                    console.log("Load was aborted")
                    return
                }
                enqueueSnackbar(`Failed to documents for ${collectionId}`, { variant: 'error' })
            }
        )
    }, [tenantId, wid, collectionId, enqueueSnackbar])

    
    const handleClick = ({id, doc}) => {
        setDocument(doc)
        setDocumentId(id)
    }

    return (
        <>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        {headers.map((field, index) => (
                            <TableCell key={index}>{field}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {documentList && documentList.map(entity => (
                        <TableRow key={entity.id} hover onClick={() => handleClick(entity)} >
                            <TableCell align="left">
                                    {entity.id}
                                </TableCell>
                            {headers.map(field => (
                                <TableCell key={`${entity.id}_${field}`} align="left">
                                    {entity.doc[field]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

        </>
    );
    //
    // String.prototype.trimEllip = function (length) {
    //     return this.length > length ? this.substring(0, length) + "..." : this;
    // }
    //
    // return (
    //     <>
    //         <p>DocumentList</p>
    //         <List>
    //         {documentList.map( document =>
    //              <ListItem key={document.id} selected={selected === document.id}>
    //                 <ListItemText primary={Object.values(document).join(",  ").trimEllip(50)} onClick={setSelected} />
    //             </ListItem>
    //         )}
    //         </List>
    //     </>
    // )
}


export default DocumentList