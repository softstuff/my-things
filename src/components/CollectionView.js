import React, { useState, useEffect } from 'react'
import { getSchema, listDocuments } from '../firebase/storage'
import { Paper, Grid, makeStyles, Box, Typography, AppBar, Tabs, Tab, useTheme } from '@material-ui/core'
import { useSnackbar } from 'notistack';
import DocumentList from '../components/DocumentList';
import SchemaEditor from './SchemaEditor';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
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
        height: '100%',
        overflow: 'visible',
        position: 'relative'
    },
    collection: {
        flex: '1',
        overflow: 'auto'
    },
}));

const CollectionView = ({tenantId, wid, levelPath, collectionId, documentId, editing, onDocumentSelect}) => {
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [ documentList, setDocumentList] = useState()
    const [tab, setTab] = React.useState(0);
    const [schema, setSchema] = useState()

    const collectionPath = `${levelPath}${collectionId}`

    useEffect(() => {
        console.log(' document list load for collectionId:', collectionPath)

        const unsubscribe = listDocuments(tenantId, wid, collectionPath,
            (documentIds) => {
                console.log("Loaded list documents", documentIds)
                setDocumentList(documentIds)
            }, (error) => {
                console.log(`Failed to load documents for `, collectionPath, error)
                enqueueSnackbar(`Failed to documents for ${collectionPath}`, { variant: 'error' })
            }
        )
        return unsubscribe

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, wid, collectionPath])

    useEffect(() => {
        
        return getSchema(tenantId, wid, collectionPath, 
            loaded => {
                setSchema(loaded)
                // setSchema(JSON.stringify(JSON.parse(loaded),null,2))
            },
            error => {
                console.log("Failed to load schema", error)
                enqueueSnackbar(`Failed to load schema`, { variant: 'error' })
            })
    }, [tenantId, wid, collectionPath, enqueueSnackbar])


    const handleTabChange = (_, id) => {
        setTab(id);
    };

    return (
        <> 
        {/* xs={6} md={3} xl={2} */}
            <Grid item sm={6} md={3} lg={2} className={classes.block}>
                <Box className={classes.main}>
                    <Paper className={`${classes.paper} ${classes.filter}`}>
                        Filter
                    </Paper>
                    <Paper className={`${classes.paper} ${classes.collection}`}>
                        {documentList &&
                            <DocumentList selected={documentId} documentList={documentList} onDocumentSelect={onDocumentSelect} />}

                    </Paper>
                </Box>
            </Grid>
            <Grid item sm={12} md={6} lg={8} className={classes.block}>

                <Box className={classes.main}>
                    <Paper className={`${classes.paper} ${classes.collection}`}>

                    <Typography>{collectionId}</Typography>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            aria-label="full width tabs example"
                        >
                            <Tab label="Info" {...a11yProps(0)} />
                            <Tab label="Schema" {...a11yProps(1)} />
                            <Tab label="Import" {...a11yProps(2)} />
                            <Tab label="Export" {...a11yProps(3)} />
                            <Tab label="Automation" {...a11yProps(4)} />
                        </Tabs>
                    </AppBar>

                    <TabPanel value={tab} index={0} dir={theme.direction}>
                        Info
                    </TabPanel>
                    <TabPanel value={tab} index={1} dir={theme.direction}>
                        <SchemaEditor 
                                        tenantId={tenantId}
                                        wid={wid}
                                        collectionId={collectionId}
                                        collectionPath={collectionPath}
                                        schema={schema}
                                        editing={editing} />
                    </TabPanel>
                    <TabPanel value={tab} index={2} dir={theme.direction}>
                    Import
                    </TabPanel>
                    <TabPanel value={tab} index={3} dir={theme.direction}>
                    Export
                    </TabPanel>
                    <TabPanel value={tab} index={4} dir={theme.direction}>
                    Automation
                    </TabPanel>

                    </Paper>
                </Box>
            </Grid>
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


export default CollectionView