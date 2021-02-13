import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Typography from '@material-ui/core/Typography';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Label from '@material-ui/icons/Label';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

import { useUser } from '../components/user/useUser';
import { useWorkspace } from '../components/workspace/useWorkspace';
import Paper from '@material-ui/core/Paper';
import { Button, Grid, IconButton } from '@material-ui/core';
import useDataConverter from '../components/useDataConverter';
import RawEditor from '../schema/RawEditor';
import AddSchemaCollectionForm from '../schema/AddSchemaCollectionForm';
import { useSchema } from '../schema/useSchema';
import { useConfirm } from 'material-ui-confirm';
import PropertiesEditor from '../schema/PropertiesEditor';


const useLayoutStyles = makeStyles((theme) => ({
    root: {
        // display: 'flex',
        // flexDirection: 'row',
        height: 'calc(100vh - 110px)',
        // width: '80vw',
        // padding: theme.spacing(2),
    },
    menu: {
        flexGrow: 0,
        maxWidth: '40rem',
    },
    details: {
        paddingLeft: theme.spacing(2),
        flexGrow: 1,
        // width: '100%',
        minWidth: '100rem',
        overflow: 'auto'
    },
    paper: {
        padding: theme.spacing(1),
        margin:  theme.spacing(1),
        textAlign: 'left',
        height: '100%',
        color: theme.palette.text.secondary,

    },
}))

const SchemaView = () => {
    const classes = useLayoutStyles();
    const { wid, schema } = useWorkspace()
    const { tenantId} = useUser()
    const [createCollection, setCreateCollection] = useState(false)
    const [showDetail, setShowDetail] = useState()
    const [selectedPointer, setSelectedPointer] = useState('')
    const [subSchema, setSubSchema] = useState()
    const {addNewCollection, deleteCollection, getPropertyFor, collectionIdFor} = useSchema()
    const confirm = useConfirm();

    useEffect(()=>{
        console.log('Loading details panel from ', selectedPointer, schema)
        if(!selectedPointer) return null
        if(!schema) return null

        const propertie = getPropertyFor(selectedPointer)
        console.log('got prop ', selectedPointer, propertie)
        setSubSchema(propertie)

    }, [schema, selectedPointer])

    const handleAddSubClick = (pointer) => {
        console.log('Do add sub  ', pointer)
        setSelectedPointer(pointer)
        setCreateCollection(true)
        setShowDetail('new collection')
    }


    const handleDeleteClick = (pointer) => {
        console.log('Do delete  ', pointer)
        const collectionId = collectionIdFor(pointer)
        confirm({ 
            title: `Are you sure you like to delete ${collectionId}?`,
            description: 'This action is permanent!',
            confirmationText: 'Yes',
            cancellationText: 'No' })
            .then(() => { 
                console.log("Confirmed to delete ", pointer)
                deleteCollection(pointer)
                if (selectedPointer === pointer) {
                    setSelectedPointer('')
                    setSubSchema()
                    setShowDetail()
                }
                
            })
    }

    const handleShowJsonSchema = () => {
        setShowDetail('json schema')
    }

    

    const handleOpenAddCollection = () => {
        console.log('handleOpenAddCollection')
        setSelectedPointer('')
        setCreateCollection(true)
        setShowDetail('new collection')
    }

    const handleCloseCreateNewCollection = () => {
        setCreateCollection(false)
        setShowDetail()
    }

    const handleAddNewCollection = (pointer, data) => {
        console.log('handleAddNewCollection', pointer, data)
        const childPointer = addNewCollection(pointer, data.key, data.description)
        setSelectedPointer(childPointer)
        setCreateCollection(false)
        setShowDetail()
    }

    const handleSelectedCollection = (key, pointer) => {
        console.log('handleSelectedCollection', key, pointer)
        setSelectedPointer(pointer)
        setCreateCollection(false)
        setShowDetail('collection')
    }

    return (
        <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            className={classes.root}
        >
            <Grid item sm={12} md={4} xl={2}>
                <Paper className={classes.paper}>
                    <div>
                        <Button onClick={handleOpenAddCollection}>
                            <AddIcon /> Add root collection
                        </Button>
                        <Button onClick={handleShowJsonSchema}>
                            <DirectionsRunIcon /> JSON schema
                        </Button>
                    </div>
                    
                    <TreePanel currentSelected={selectedPointer} onAddSub={handleAddSubClick} onDelete={handleDeleteClick} onSelect={handleSelectedCollection}/>
                </Paper>
            </Grid>
            
            <Grid item sm={12} md={8} xl={10}>
                <Paper className={classes.paper}>
                    {(()=>{
                        if (showDetail === 'new collection') {
                            return <AddSchemaCollectionForm forbiddenNames={[]} pointer={selectedPointer} onNewCollection={handleAddNewCollection} onCancel={handleCloseCreateNewCollection} />
                        } else if (showDetail === 'json schema') {
                            return  <RawEditor tenantId={tenantId} wid={wid} schema={schema} />
                        } else if (!schema) {
                            return <p>Create a schema</p>
                        } else if (!subSchema) {
                            return <p>Nothing selected yet</p>
                        } else {
                            return <>
                                <PropertiesEditor pointer={selectedPointer} subSchema={subSchema} />
                            </>
                            // return <>
                            //     <SchemaPropertyEditor editing={true} pointer={selectedPointer} schema={subSchema} onCreateNewRequest={handleAddSubClick} onDeleteRequest={handleDeleteClick}  />
                            //     <pre>{JSON.stringify(subSchema, null, 2)}</pre>
                            // </>
                        }
                    })()}
                </Paper>
            </Grid>
           
        </Grid>
    )
}



const useTreeItemStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.text.secondary,
        '&:hover > $content': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:focus > $content, &$selected > $content': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
            color: 'var(--tree-view-color)',
        },
        '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
            backgroundColor: 'transparent',
        },
    },
    content: {
        color: theme.palette.text.secondary,
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '$expanded > &': {
            fontWeight: theme.typography.fontWeightRegular,
        },
    },
    group: {
        marginLeft: theme.spacing(0),
        '& $content': {
            paddingLeft: theme.spacing(1),
        },
    },
    expanded: {},
    selected: {},
    label: {
        fontWeight: 'inherit',
        color: 'inherit',
    },
    labelRoot: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
        marginRight: theme.spacing(1),
    },
    labelText: {
        fontWeight: 'inherit',
        flexGrow: 1,
    },
}));

const useStyles = makeStyles({
    root: {
        // height: 264,

    },
});
const TreePanel = ({currentSelected, onAddSub, onDelete, onSelect}) => {
    const classes = useStyles();
    const { schema } = useSchema()
    const {schemaPropsToList} = useDataConverter()
    const [schemaTreeNodes, setSchemaTreeNodes] = useState()
    const [expanded, setExpanded] = React.useState([]);
    const [selected, setSelected] = React.useState([]);

    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
    };

    const handleSelect = (event, nodeIds) => {
        setSelected(nodeIds);
    };
    
    useEffect(() => {
        if(!expanded.includes(currentSelected)){
            setExpanded([...expanded, currentSelected])
        }

        setSelected([currentSelected])
    }, [currentSelected])

    console.log('expanded', expanded)
    console.log('selected', selected)
    console.log('currentSelected', currentSelected)

    const renderTree = (schema, parentPointer) => 
        schemaPropsToList(schema)
        .filter(prop=>prop.type == 'array')
        .map(prop => {
            const pointer = `${parentPointer}properties/${prop.key}`
            //  onClick={()=>onEdit(prop.key, pointer)}
            return (
                <StyledTreeItem key={pointer} nodeId={pointer} labelText={prop.key} labelIcon={Label} onAddSub={onAddSub} onDelete={onDelete} onSelect={onSelect}>
                    {prop.items && (renderTree(prop.items, `${pointer}/items/`))}
                </StyledTreeItem>)})
    

    useEffect(()=>{
        const tree = renderTree(schema, '/')
        setSchemaTreeNodes(tree)
        console.log("print tree from schema", schema)
    },[schema])

    return (
        <TreeView
            className={classes.root}
            defaultExpanded={['3']}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleToggle}
            onNodeSelect={handleSelect}
        >
            {schemaTreeNodes}

        </TreeView>)

}

function StyledTreeItem(props) {
    const classes = useTreeItemStyles();
    const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, onAddSub, onDelete, onSelect, ...other } = props;

    const handleAddClick = e => {
        onAddSub(other.nodeId)
        e.stopPropagation()
    }

    const handleDeleteClick = e => {
        onDelete(labelText, other.nodeId)
        e.stopPropagation()
    }

    const handleItemClick = e => {
        onSelect(labelText, other.nodeId)
        e.stopPropagation()
    }

    
    return (
        <TreeItem
            onClick={handleItemClick}
            label={
                <div className={classes.labelRoot}>
                    <LabelIcon color="inherit" className={classes.labelIcon} />
                    <Typography variant="body2" className={classes.labelText}>
                        {labelText}
                    </Typography>
                    <Typography variant="caption" color="inherit">
                        {labelInfo}
                        {/* <IconButton aria-label="add child schema" className={classes.margin} color='primary' onClick={handleAddClick}>
                            <AddIcon />
                        </IconButton>
                        <IconButton aria-label="delete schema" className={classes.margin} color='primary' onClick={handleDeleteClick}>
                            <DeleteIcon />
                        </IconButton> */}
                    </Typography>
                </div>
            }
            style={{
                '--tree-view-color': color,
                '--tree-view-bg-color': bgColor,
            }}
            classes={{
                root: classes.root,
                content: classes.content,
                expanded: classes.expanded,
                selected: classes.selected,
                group: classes.group,
                label: classes.label,
            }}
            {...other}
        />
    );
}

StyledTreeItem.propTypes = {
    bgColor: PropTypes.string,
    color: PropTypes.string,
    labelIcon: PropTypes.elementType.isRequired,
    labelInfo: PropTypes.string,
    labelText: PropTypes.string.isRequired,
};





export default SchemaView