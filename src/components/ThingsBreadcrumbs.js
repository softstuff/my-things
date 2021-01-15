import React, { useEffect, useState } from 'react'
import { Link, Breadcrumbs, TextField, makeStyles, Tooltip} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { useForm } from 'react-hook-form';


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
    
const ThingsBreadcrumbs = ({ levelPath, collectionId, documentId, onPathChange}) => {
    const classes = useStyles();
    const [crums, setCrums] = useState([])
    const [manual, setManual] = useState(false)
    const { register, handleSubmit, setValue} = useForm()

    const onSubmit = data => {
           console.log("onSubmit", data)
           const npath = data.newPath.trim().replace(/\/+$/, "").split('/')
           
           onPathChange(npath)
           setManual(false)
    }
    const onBlur = () => {
        toggle()
    }
    const toggle = () => {
        setManual(!manual)
    }

    const path = [collectionId, documentId]
    
    

    const joinToPath = (levelPath, collectionId, documentId) => `${levelPath}${collectionId ? `/${collectionId}` : ''}${documentId ? `/${documentId}` : ''}`
    
    useEffect(()=>{
        
        const path = joinToPath(levelPath, collectionId, documentId)
        
        setValue('newPath', path)

        const crumDataList = processToCrumData(levelPath, collectionId, documentId)

        var links = []
        crumDataList.forEach( data =>  {                   
            links.push({levelPath: data.levelPath, collectionId: data.collectionId, title: data.collectionId})
            if (data.documentId) {
                links.push({...data, title: data.documentId})
            }
        })
        setCrums( links )

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[levelPath, collectionId, documentId])


    

    return (
        <div style={{width: '50%', display: 'flex'}}>
            <BorderColorIcon style={{marginRight: '1rem'}} onClick={toggle}>ss</BorderColorIcon>

            { manual ? (
                <div style={{width: '100%'}}>
                <form onSubmit={handleSubmit(onSubmit)} >
                        <TextField name='newPath' inputRef={register} onBlur={onBlur} defaultValue={path.join('/')} fullWidth={true}/>
                </form>
                </div>
            ) : (
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" onClick={()=>onPathChange( {levelPath: '/'})}>
                        <Tooltip title="Back to workspace" aria-label="to workspace">
                            <HomeIcon className={classes.icon}/>
                        </Tooltip>
                    </Link>

                    {crums.map( (crum, index) => 
                        <Link key={index} color="inherit" onClick={()=>onPathChange(crum)}>
                            {crum.title}
                        </Link>)}
                </Breadcrumbs>
            )}
            
        </div>
        )
}



export default ThingsBreadcrumbs
