import React, { useState, useEffect } from 'react'
import { Grid, IconButton, Icon, TextField, Button, AppBar, Tabs, Tab, Box, useTheme,makeStyles } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete';
import { getDocument, deleteCollection, updateThing, addSubCollection, getSchema } from '../firebase/storage'
import { useForm} from 'react-hook-form';
import { useSession } from '../firebase/UserProvider';
import { useSnackbar } from 'notistack';
import AttributesSchemaEditor from './document/AttributesSchemaEditor';
import { useWorkspace } from './workspace/useWorkspace';
const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }));

function DocumentView({ create, collectionPath, collectionId, documentId, onSubCollectionClick, editing, onDocumentIdChange }) {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const [document, setDocument] = useState()
    const [schema, setSchema] = useState()
    const [children, setChildren] = useState([])
    const { claims } = useSession()
    const { workspace } = useWorkspace()
    // const documentId = toDocumentId(path)
    const dbKey = ''
    const tenantId = claims.myThings.tenantId
    const wid = workspace.id

    useEffect(() => {

        if (create) {
            setDocument({
                meta: {
                    children: []
                },
                thing: {}
            })
            return null
        }
        else if (collectionPath && documentId) {
            console.log('Loading document ', collectionPath, documentId)
            const unsubscribe = getDocument(tenantId, wid, collectionPath, documentId,
                (data) => {
                    if (data) {
                        console.log("Loaded document", collectionPath, documentId, data)
                        setDocument(data)
                    } else {
                        setDocument()
                    }
                }, (error) => {
                    console.log(`Failed to load document:`, collectionPath, documentId, error)
                }
            )
            return unsubscribe
        }


    }, [tenantId, wid, collectionPath, documentId, create])

    useEffect(()=>{
        return getSchema(tenantId, wid, collectionPath,
            loaded => {
                console.log('Loaded schema', loaded)
                setSchema(loaded)

                
                const ch = Object.getOwnPropertyNames(loaded.properties).map(key=>{
                        return {
                            key: key,
                            type: loaded.properties[key].type,
                            order: loaded.properties[key].order
                        }
                    })
                    .filter(item => item.type == 'array')
                    .map(item => item.key)
                console.log("Loaded children ", ch)
                setChildren(ch)
            },
            error => {
                console.log("Failed to load schema", error)
                enqueueSnackbar(`Failed to load schema`, { variant: 'error' })
            })

    }, [tenantId, wid, collectionPath, getSchema, setSchema, enqueueSnackbar, setChildren])
    


    const handleSubCollectionClick = (subCollectionName) => {
        const newPath = `${collectionPath}/${documentId}/${subCollectionName}`
        console.log('selected a subcollection, opening ', newPath)
        onSubCollectionClick(subCollectionName)
    }

    const onSaveThing = async (thing) => {
        try {
            let docId = documentId
            if(thing.id){
                docId = thing.id
                delete thing.id
            }
            console.log('onSaveThing', thing, collectionPath, docId)
            await updateThing(tenantId, wid, collectionPath, docId, thing)
            onDocumentIdChange(docId)
            enqueueSnackbar(`${docId} was saved`, { variant: 'success' })
        } catch (error) {
            console.log("onSave, error", error)
            enqueueSnackbar(`Failed to save`, { variant: 'error' })
        }
    }

    const handleAddChild = name => {
        try {
            console.log("handleAddChild", name)
            addSubCollection(tenantId, wid, collectionPath, documentId, name)
        } catch (error) {
            console.log("handleAddChild, error", error, name)
            enqueueSnackbar(`Failed to add collection`, { variant: 'error' })
        }
    }

    const handleRemoveChild = name => {
        try {
            console.log("handleRemoveChild, name:", name)
            const path = `${collectionPath}/${documentId}/${name}`
            deleteCollection(tenantId, wid, path)

        } catch (error) {
            console.log("handleRemoveChild, error", error, name)
            enqueueSnackbar(`Failed to remove collection`, { variant: 'error' })
        }
    }

    return (

        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <h2>
                        {create && ('Create a Thing')}
                        {!create && (documentId)}
                    </h2>
                </Grid>

                {editing ? (
                    <Grid item xs={10}>
                        <AttributesSchemaEditor doc={document} onSaveThing={onSaveThing} create={create} schema={schema} />
                        <h2>Collections</h2>
                        <EditDocChildren doc={document} onAddChild={handleAddChild} onRemoveChild={handleRemoveChild} onSubCollectionClick={handleSubCollectionClick} />
                    </Grid>
                ) : (
                        <Grid item xs={10}>
                            <h2>Attributes</h2>
                            {document?.thing && Object.getOwnPropertyNames(document.thing)
                                .filter((key) => key !== 'metaInfo')
                                .map((attib) => <div key={attib}>{attib} = {document.thing[attib]}</div>)}

                            <h2>Collections</h2>
                            {children.map(childCollectionId => (
                                <div key={childCollectionId} >
                                    <Button onClick={() => handleSubCollectionClick(childCollectionId)}>{childCollectionId}</Button>
                                </div>
                            ))}

                            {/* {document?.meta?.children.map((collectionId) =>
                                <div key={collectionId} >
                                    <Button onClick={() => handleSubCollectionClick(collectionId)}>{collectionId}</Button>
                                </div>)} */}
                        </Grid>
                    )}
                <Grid item xs={10}>
                    JSON:
                    <pre>{JSON.stringify(document, null, 2)}</pre>
                </Grid>
            </Grid>
        </>
    )

}

function EditAttributes({ create, doc, onSaveThing, schema }) {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Manuell" {...a11yProps(0)} />
                    <Tab label="By schema" {...a11yProps(1)} />
                    <Tab label="Raw" {...a11yProps(2)} />
                </Tabs>
            </AppBar>

            <TabPanel value={value} index={0} dir={theme.direction}>
                <AttributesSchemaEditor doc={doc} onSaveThing={onSaveThing} create={create} schema={schema} />
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
                <AttributesSchemaEditor doc={doc} onSaveThing={onSaveThing} create={create} schema={schema} />
            </TabPanel>
            <TabPanel value={value} index={2} dir={theme.direction}>
                TODO edit by Json
         </TabPanel>

        </>
    )
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

function EditDocChildren({ doc, onAddChild, onRemoveChild, onSubCollectionClick }) {

    const { register, handleSubmit, reset, errors } = useForm()


    const onAddCollection = (data) => {
        console.log('onAddCollection ', data.newCollection)
        onAddChild((data.newCollection))
        reset({ newCollection: '' })
    }

    const onDelete = (name) => {
        onRemoveChild(name)
    }

    return (
        <form>
            {doc?.meta?.children && doc.meta.children.map((name, index) =>
                <div key={index}>
                    <Button onClick={() => onSubCollectionClick(name)}>{name}</Button>
                    <IconButton aria-label="delete" onClick={() => onDelete(name)}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            )}

            <TextField name='newCollection' label="New collection" inputRef={register({
                validate: value => {
                    if (value === 'meta') {
                        return false
                    }
                    if (doc?.meta?.children) {
                        return !doc?.meta?.children.some(child => value === child) || 'Child name must be uniqe'
                    }
                    return true
                }
            })}
                helperText={errors.name?.message}
                error={errors.name ? true : false} />
            <IconButton aria-label="add" onClick={handleSubmit(onAddCollection)}>
                <Icon>add_circle</Icon>
            </IconButton>
        </form>
    )
}
// function toDocumentId(path) {
//     if (path.length % 2 === 0) {
//         return path.slice(path.length - 1)
//     } else {
//         return null
//     }
// }

export default DocumentView

// {doc?.thing && Object.keys(doc.thing)
//     .map((attib, index) => 
//         <div className={classes.editRow} key={index}>
//             <TextField className={classes.editField} name={attib} label={attib} defaultValue={doc.thing[attib]} inputRef={register} />
//             <IconButton aria-label="delete">
//                 <DeleteIcon />
//             </IconButton>
//         </div>
//     )}
    // <div className={classes.editRow}>
    //     <TextField className={classes.newAttribName}  placeholder='Name' inputRef={newAttribNameRef} />
    //     <TextField className={classes.newAttribValue} placeholder='Value' inputRef={newAttribValueRef}/>
    //     <IconButton aria-label="add" onClick={handleNewValue}>
    //         <Icon>add_circle</Icon>
    //     </IconButton>
    // </div>
// <FormControl>
//     <Button variant="contained" color="primary" type='submit'>
//         Save
//     </Button>
// </FormControl>