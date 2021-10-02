import React, {useState} from 'react'
import { Breadcrumbs, Link, TextField, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import HomeIcon from '@mui/icons-material/Home';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import {useForm} from 'react-hook-form';
import {useEditor} from '../editor/useEditor';


export const processToCrumData = (levelPath, collectionId, documentId) => {
    const crumData = []

    const levelParts = levelPath.split('/')

    for (let i = 1; i < levelParts.length-1; i=i+2) {
        const levelPath = levelParts.length === 2 ? '/' : levelParts.slice(0, i ).join('/') + '/'
        const collectionId = levelParts[i]
        const documentId = (i + 1) < levelParts.length ? levelParts[i+1] : null

        if (collectionId) {
            crumData.push({ levelPath, collectionId, documentId })
        }
    }
    if (collectionId) {
        crumData.push({ levelPath, collectionId, documentId })
    }

    return crumData

}


const useStyles = makeStyles((theme) => ({
    separator: {
        marginLeft: '1rem',
        marginRight: '1rem',
    },
    icon: {
        marginRight: theme.spacing(0.5),
        width: 20,
        height: 20,
    },
}));

const ThingsBreadcrumbs = () => {
    const classes = useStyles();
    const {collectionId, documentId, setCollectionId, setDocumentId} = useEditor()
    const [manual, setManual] = useState(false)
    const { register, handleSubmit} = useForm()

    const handleChange = (newCollectionId, newDocumentId) => {
        setDocumentId(newDocumentId)
        setCollectionId(newCollectionId)
    }

    const onSubmit = data => {
           console.log("onSubmit", data)
           const npath = data.newPath.trim().replace(/\/+$/, "").split('/')
           
           console.log("onSubmit to path ", npath)
           setManual(false)
    }

    const onBlur = () => {
        toggleManual()
    }

    const toggleManual = () => {
        setManual(!manual)
    }
    
    return (
        <div style={{width: '50%', display: 'flex'}}>
            <BorderColorIcon style={{marginRight: '1rem'}} onClick={toggleManual}>ss</BorderColorIcon>

            { manual ? (
                <div style={{width: '100%'}}>
                <form onSubmit={handleSubmit(onSubmit)} >
                        <TextField name='newPath' {...register("newPath")} onBlur={onBlur} defaultValue={`${collectionId}/${documentId}`} fullWidth={true}/>
                </form>
                </div>
            ) : (
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" onClick={()=>handleChange( null, null)}>
                        <Tooltip title="Back to workspace" aria-label="to workspace">
                            <HomeIcon className={classes.icon}/>
                        </Tooltip>
                        Editor
                    </Link>

                    {collectionId && documentId && (                        
                        <Link color="inherit" onClick={()=>handleChange(collectionId, null)}>
                            {collectionId}
                        </Link>
                    )}

                    {collectionId && !documentId && (
                        <Typography color="textPrimary">{collectionId}</Typography>
                    )}

                    {documentId && (
                        <Typography color="textPrimary">{documentId}</Typography>
                    )}
                    
                </Breadcrumbs>
            )}
            
        </div>
        )
}



export default ThingsBreadcrumbs
