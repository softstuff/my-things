import React, { useState, useEffect } from 'react'
import { addNewCollection, deleteCollection, getLevelInfo } from '../firebase/storage'
import { Paper, Grid, makeStyles, FormControlLabel, Switch, Box } from '@material-ui/core'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import ThingsBreadcrumbs from '../components/ThingsBreadcrumbs';

import { useSession } from '../firebase/UserProvider';
import CollectionList from '../components/CollectiontList';
import DocumentView from '../components/DocumentView';
import { useSnackbar } from 'notistack';
import CollectionView from '../components/CollectionView';
import { useWorkspace } from '../components/workspace/useWorkspace';




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
        height: '70vh',
        overflow: 'visible',
        position: 'relative'
    },
    collection: {
        height: '70vh',
        overflow: 'auto'
    },
    thing: {
        height: '70vh',
        overflow: 'auto'
    },
    addCollectionIcon: {
        position: 'absolute',
        right: '30px',
        bottom: '15px'
    },
    addDocumentIcon: {
        position: 'absolute',
        right: '30px',
        bottom: '15px'
    }
}));

function Editor() {

    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const [ editing, setEditing] = useState(false)
    const { claims } = useSession()
    const { wid } = useWorkspace()
    const [ levelPath, setLevelPath] = useState('/')
    const [ collectionList, setCollectionList] = useState([])
    const [ collectionId, setCollectionId] = useState()
    const [ documentId, setDocumentId] = useState()
    const [createDocument, setCreateDocument] = useState(false)

    const tenantId = claims.myThings.tenantId

    useEffect(() => {
        const unsubscribe = getLevelInfo(tenantId, wid, levelPath,
            (meta) => {
                console.log(`Load level info at levelPath '${levelPath}'`, meta)
                setCollectionList(meta?.children || [])
            }, (error) => {
                console.log(`Failed to load level info ${levelPath}`, error)
                enqueueSnackbar(`Failed to load  level info ${levelPath}`, { variant: 'error' })
            }
        )
        return unsubscribe

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, wid, levelPath])


    


    // const onMetaSave =  (meta) => {
    //    console.log('onMetaSave', meta)
    //    updateCollectionMetadata(tenantId, wid, meta.id, meta.displayName)

    // }

    // const onCreateFirstCollection =  (data) => {
    //     console.log('onCreateFirstCollection', data)
    //     addNewCollection(tenantId, wid,  data.name)
    //     setOpenCreateCollectionDialog(false)
    //  }
    // const onCreateFirstCollectionOld =  (meta) => {
    //     console.log('onCreateFirstCollection', meta)
    //     addNewCollection(tenantId, wid,  meta.id, meta.displayName)

    //  }

    const handleCreateCollection = () => {
        console.log("Create collection")
        const id = window.prompt("Enter the identifyer for the collection")
        try {
            if (id) {

                console.log(`test`, id, collectionList)
                if (collectionList.includes(id)) {
                    enqueueSnackbar(`Collection ${id} already exists`, { variant: 'error' })
                } else {

                    addNewCollection(tenantId, wid, id)
                    setCollectionId(id)
                    setDocumentId()
                }
            }
        } catch (error) {
            console.log('FAILED handleCreateCollection', error, id)
            enqueueSnackbar(`Collection ${id} could not be created`, { variant: 'error' })
        }
    }

    const handleCreateDocument = () => {
        console.log('handleCreateDocument', createDocument)
        setCreateDocument(true)
        console.log('handleCreateDocument after ', createDocument)
    }

    const handleDeleteCollection = (id) => {
        console.log("Delete collection", id)
        const confirmed = window.confirm("Are you sure?")
        if (confirmed) {
            deleteCollection(tenantId, wid, id)
        }
        if (collectionId === id) {
            setCollectionId()
            setDocumentId()
        }
    }

    const onDocumentSelect = (documentId) => {
        console.log('onDocumentSelect', documentId)
        setCreateDocument(false)
        setDocumentId(documentId)

    }
    const onCollectionSelected = async (_collectionId) => {
        console.log('onCollectionSelected', _collectionId)
        try {
            setCreateDocument(false)
            setCollectionId(_collectionId)
            setDocumentId()
        } catch (error) {
            console.log('FAILED onCollectionSelected', error)
        }
    }


    const handlePathChange = ({ levelPath, collectionId, documentId }) => {
        console.log('handlePathChange', levelPath, collectionId, documentId)
        setDocumentId(documentId)
        setCollectionId(collectionId)
        setLevelPath(levelPath)
    }

    const handleSubCollectionTransition = subCollectonId => {
        const newLevelPath = `${levelPath ? levelPath : '/'}${collectionId}/${documentId}/`
        console.log('Setting new levelPath to ', newLevelPath)
        setDocumentId()
        setCollectionId(subCollectonId)
        setLevelPath(newLevelPath)
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
                                levelPath={levelPath}
                                collectionId={collectionId}
                                documentId={documentId}
                                onPathChange={handlePathChange} />

                            <FormControlLabel
                                control={<Switch checked={editing} onChange={() => setEditing(!editing)} />}
                                label="Edit"
                            />
                        </Grid>
                    </Paper>
                </Grid>
                
                <Grid item sm={6} md={3} lg={2}>
                    <Box className={classes.main}>
                        <Paper className={`${classes.paper} ${classes.collection}`}>

                            <CollectionList selected={collectionId} collections={collectionList} onCollectionSelected={onCollectionSelected}
                                editing={editing} onDelete={handleDeleteCollection}></CollectionList>

                        </Paper>
                        {editing && (
                            <>
                                <Fab className={classes.addCollectionIcon} color="primary" aria-label="add" onClick={handleCreateCollection}>
                                    <AddIcon />
                                </Fab>
                            </>)}
                    </Box>
                </Grid>
                {!documentId && !collectionId && !createDocument  && 
                    <p>Welcome add or select your collection</p>
                }
                {!documentId && collectionId && !createDocument &&
                    <CollectionView 
                        tenantId={tenantId}
                        wid={wid}
                        levelPath={levelPath} 
                        collectionId={collectionId} 
                        documentId={documentId} 
                        editing={editing}
                        onDocumentSelect={onDocumentSelect}
                        onDocumentCreate={handleCreateDocument} /> }
                {(documentId || createDocument) && <>
                    
                    <Grid item sm={6} md={9} lg={10}>
                        <Box className={classes.main}>
                            <Paper className={`${classes.paper} ${classes.thing}`}>
                                <DocumentView
                                    create={createDocument}
                                    collectionPath={`${levelPath ? levelPath : '/'}${collectionId}`}
                                    collectionId={collectionId}
                                    documentId={documentId}
                                    editing={editing}
                                    onDocumentIdChange={onDocumentSelect}
                                    onSubCollectionClick={handleSubCollectionTransition} />

                            </Paper>

                            {editing && !createDocument && (
                                <Fab className={classes.addDocumentIcon} color="primary" aria-label="add" onClick={handleCreateDocument}>
                                    <AddIcon />
                                </Fab>)}
                        </Box>
                    </Grid>
                </>}
            </Grid>
        </div>
    )
}



// function CollectionList({ path, onPathChange }) {
//     const classes = useStyles();
//     const paperEl = useRef(null);
//     const { claims } = useSession()
//     const { workspace } = useWorkspace()
//     const [collection, setCollection] = useState({
//         keys: []
//     })
//     const collectionPath = toCollectionPath(path)
//     const dbKey = collectionPath.join('/')
//     const collectionId = `tenants/${tenantId}/workspaces/${workspace?.id}/${dbKey}`

//     useEffect(() => {
//         if(dbKey) {
//             console.log("claims", claims)
//             console.log("Loading", `${collectionId}`)
//             const colRef = firestore.collection(collectionId)
//             const unsubscribe = colRef.onSnapshot((snapshot) => {

//                 const metaData = snapshot.docs.find( doc => doc.id === 'meta')
//                 const data = snapshot.docs.filter(doc => doc.id !== 'meta').map((doc) => {
//                     return doc.id
//                 })
//                 setCollection({ 
//                     meta: metaData,
//                     keys: data,
//                 })

//             }, (error) => {
//                 console.log('Error', error)
//             })

//             return () => unsubscribe()
//         } else {
//             console.log('No collection found', dbKey)
//         }

//     }, [dbKey])

//     const addCollection = async (name) =>  {
//         console.log("addCollection", name)
//         const ref = await firestore.collection(`${collectionId}${name}`).add({ meta: {}})
//         console.log("addCollection", name, 'was saved', ref.id)
//     }
//     const handleClick = (docName) => {
//         onPathChange(collectionPath.concat([docName]))
//     }
//     return (
//         <>
//                 <h2>{collectionPath[collectionPath.length -1]} ({collection.keys.length})</h2>
//                 <ol>
//                     {collection.keys
//                         .filter(name => name !== 'meta')
//                         .map((key, index) => 
//                             <CollectionItem key={index} name={key} onClick={() => handleClick(key)} />)}


//                     {/* <li><AddCollection onAdd={addCollection} forbiddenNames={[...collection.keys, 'meta']} /></li> */}
//                 </ol>



//         </>
//     )
// }



// const NewCollectionDialog = (props) => {
//     const { onCreate, onClose, open, knownChildren, ...other } = props;
//     const { register, errors, handleSubmit } = useForm()

//     const handleCancel = () => {
//         onClose();
//     };


//     return (
//         <Dialog
//             disableBackdropClick
//             disableEscapeKeyDown
//             maxWidth="xs"
//             aria-labelledby="confirmation-dialog-title"
//             open={open}
//             {...other}
//         >
//             <DialogTitle id="confirmation-dialog-title">Name your new collection</DialogTitle>
//             <DialogContent dividers>
//                 <form id='formet' onSubmit={handleSubmit(onCreate)} >
//                     <TextField name='name' label='Name' inputRef={register({
//                         required: "You forgot to enter the name"
//                     })}

//                         helperText={errors.name?.message}
//                         error={errors.name ? true : false} />
//                 </form>
//             </DialogContent>
//             <DialogActions>
//                 <Button autoFocus onClick={handleCancel} color="primary">
//                     Cancel
//           </Button>
//                 <Button form='formet' color="primary" type='submit'>
//                     Create
//           </Button>

//             </DialogActions>
//         </Dialog>
//     )
// }


export default Editor