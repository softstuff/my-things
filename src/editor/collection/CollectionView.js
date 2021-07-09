import React, { useState } from 'react'
import {AppBar, Box, Fab, makeStyles, Tab, Tabs, useTheme} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import DocumentList from './DocumentList';
import {useEditor} from '../useEditor';
import CollectionInfo from "./CollectionInfo";
import AddDocumentDialog from '../document/AddDocumentDialog';
import { createThing } from '../../firebase/storage';
import { useWorkspace } from '../../components/workspace/useWorkspace';
import ImportView from './import/ImportView';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        // padding: theme.spacing(2),
        textAlign: 'left',
        color: theme.palette.text.secondary,

    },
    filter: {
        marginBottom: theme.spacing(2),
        // flex: '1',
    },
    main: {
        display: 'flex',
        flexFlow: 'column',
        overflow: 'visible'
    },
    collection: {
        flex: '1',
        overflow: 'auto'
    },
    fab: {
        position: 'absolute',
        right: theme.spacing(8),
        bottom: theme.spacing(8)
    }
}));

const CollectionView = () => {
    const classes = useStyles();
    const theme = useTheme();
    const {tenantId, wid} = useWorkspace()
    const {collectionId, editing} = useEditor()
    const [showAddNewDocumentDialog, setShowAddNewDocumentDialog] = useState(false)

    const [tab, setTab] = useState(2);

    // useEffect(() => {

    //     return getSchema(tenantId, wid, collectionPath,
    //         loaded => {
    //             setSchema(loaded)
    //             // setSchema(JSON.stringify(JSON.parse(loaded),null,2))
    //         },
    //         error => {
    //             console.log("Failed to load schema", error)
    //             enqueueSnackbar(`Failed to load schema`, { variant: 'error' })
    //         })
    // }, [tenantId, wid, collectionPath, enqueueSnackbar])


    const handleTabChange = (_, id) => {
        setTab(id);
    };
    

    const handleOpenAddDocumentDialog = () => {
        setShowAddNewDocumentDialog(true)
    }
    
    const handleAddNewDocuemnt = async (data) => {

        console.log("add document", data, tenantId, wid, collectionId)
        const added = await createThing(tenantId, wid, collectionId, data.id, {})
        console.log("Saved ", added)
        setShowAddNewDocumentDialog(false)
    }

// {/* xs={6} md={3} xl={2} */}
//             {/* <Grid item sm={6} md={3} lg={2} className={classes.block}>
//                 <Box className={classes.main}>
//                     <Paper className={`${classes.paper} ${classes.filter}`}>
//                         Filter
//                     </Paper>
//                     <Paper className={`${classes.paper} ${classes.collection}`}>
//                         {/* {documentList &&
//                             <DocumentList selected={documentId} documentList={documentList} onDocumentSelect={onDocumentSelect} />} */}

//                             </Paper>
//                             {editing && !createDocument && (
//                                 <Fab className={classes.addDocumentIcon} color="primary" aria-label="add" onClick={onDocumentCreate}>
//                                     <AddIcon />
//                                 </Fab>)}
//                         </Box>
//                     </Grid> */}
    return (
        <>

            <div className={`${classes.main}`}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={tab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                    >
                        <Tab label="Lista" {...a11yProps(0)} />
                        <Tab label="Info" {...a11yProps(0)} />
                        {/* <Tab label="Schema" {...a11yProps(1)} /> */}
                        <Tab label="Import" {...a11yProps(2)} />
                        <Tab label="Export" {...a11yProps(3)} />
                        <Tab label="Automation" {...a11yProps(4)} />
                    </Tabs>
                </AppBar>

                <TabPanel value={tab} index={0} dir={theme.direction}>
                    <DocumentList/>

                    {editing && (
                    <Fab color="primary" aria-label="add" className={classes.fab} onClick={handleOpenAddDocumentDialog}>
                        <AddIcon/>
                    </Fab>)}
                    
                    <AddDocumentDialog
                        open={showAddNewDocumentDialog}
                        handleClose={()=>setShowAddNewDocumentDialog(false)}  
                        handleAddNew={handleAddNewDocuemnt}/>

                </TabPanel>
                <TabPanel value={tab} index={1} dir={theme.direction}>
                    Info
                    <CollectionInfo />
                </TabPanel>
                {/* <TabPanel value={tab} index={1} dir={theme.direction}>
                            <SchemaEditor
                                tenantId={tenantId}
                                wid={wid}
                                collectionId={collectionId}
                                collectionPath={collectionPath}
                                schema={schema}
                                editing={editing} /> */}
                {/* </TabPanel> */}
                <TabPanel value={tab} index={2} dir={theme.direction}>
                    <ImportView />
                </TabPanel>
                <TabPanel value={tab} index={3} dir={theme.direction}>
                    Export
                </TabPanel>
                <TabPanel value={tab} index={4} dir={theme.direction}>
                    Automation
                    {editing && (
                    <Fab color="primary" aria-label="add" className={classes.fab}>
                        <AddIcon/>
                    </Fab>)}
                </TabPanel>
            </div>

        </>
    )
}


function TabPanel(props) {
    const {children, value, index, ...other} = props;

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


export default CollectionView