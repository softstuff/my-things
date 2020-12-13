import React, { useState, useEffect } from 'react'
import { Grid, IconButton, Icon, TextField, Button, makeStyles } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete';
import { getDocument, updateDocument, addCollection, deleteCollection } from '../firebase/storage'
import { useForm, useFieldArray } from 'react-hook-form';


const useStyles = makeStyles((theme) => ({
    editRow: {
        width: '80%',
        height: '4rem'
    },
    editField: {
        width: '90%'
    },
    newAttribName: {
        width: '45%'
    },
    newAttribValue: {
        width: '45%'
    }
}));


function DocumentView({ path, onPathChange, editing }) {

    const [ doc, setDoc ] = useState({})
    const documentId = toDocumentId(path)
    const dbKey = path.join('/')

    useEffect(() => {
        if (!!documentId) {
            
            const onLoaded = (data) => {
                console.log(`Document ${dbKey} is loaded`, data)
                setDoc(data)
            }
            const onError = (error) => {
                console.log(`Failed to load document ${dbKey}`, error)
                setDoc(null)
            }
            const unsubscribe = getDocument(dbKey, onLoaded, onError)

            return () => unsubscribe()
        } else {
            setDoc(null)
            return null
        }
    }, [dbKey, editing, documentId])


    const handleClick = (subCollectionName) => {
        const newPath = path.concat(subCollectionName)
        console.log('newPath', newPath, subCollectionName)
        onPathChange(newPath)
    }
    return (

        <>
            { !documentId ? (
                <p>No document selected</p>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        Document
                        <h2>{documentId}</h2>
                    </Grid>

                    { editing ? (
                        <Grid item xs={10}>
                            <h2>Attributes</h2>
                            <EditAttributes doc={doc} dbKey={dbKey}></EditAttributes>
                            <h2>Collections</h2>
                            <EditDocChildren doc={doc} dbKey={dbKey}></EditDocChildren>
                        </Grid>
                    ) : (
                        <Grid item xs={10}>
                            <h2>Attributes</h2>
                            {doc?.thing && Reflect.ownKeys(doc.thing)
                                .filter((key) => key !== 'metaInfo')
                                .map((attib) => <div key={attib}>{attib} = {doc.thing[attib]}</div>)}
                            
                            <h2>Collections</h2>
                            {doc?.meta?.children && doc.meta.children.map((name) => 
                                <div><Button key={name} onClick={() => handleClick(name)}>{name}</Button></div>)}
                        </Grid>
                        )}
                </Grid>
            )}
        </>
    )

}

function EditAttributes( { doc, dbKey } ) {
    const classes = useStyles();
    const { register, handleSubmit, control} = useForm()
    const { register: registerAddAttribute, handleSubmit: handleSubmitAddAttribute, reset: resetAddAttribute, errors} = useForm()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "thing", 
      });
   

      useEffect(() => {
          remove()
          if (doc) {
            Reflect.ownKeys(doc?.thing).forEach(attribute => {
                append({name: attribute, value: doc.thing[attribute]})
            })
          }
      }, [doc, dbKey, append, remove])
       

    const onSave = (data) => {
        try {
            const toSave = {...doc, thing: data }
            console.log("onSave", toSave)
            const onSuccess = () => {
                console.log(`Document ${dbKey} was saved`, toSave)
            }
            const onFailed = (error) => {
                console.log(`Failed to save document ${dbKey}`, toSave, error)
            }
            updateDocument(dbKey, toSave, onSuccess, onFailed)
            
        } catch(error) {
            console.log("onSave, error", error)
        }
    }
    


    const onAddNewAttribute = (data) => {
        console.log(`Add attribute ${data.name}: ${data.value}`)
        append({name: data.name, value: data.value})
        resetAddAttribute()
    }

    return (
        <>
            <form >
            {fields.map((item, index) => (
                <div className={classes.editRow} key={item.id}>
                    <TextField className={classes.editField} 
                    required
                    name={item.name}
                    label={item.name}
                    inputRef={register()}
                    defaultValue={item.value}/>
                    <IconButton aria-label="delete" onClick={()=>remove(index)}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            ))}

            </form>
        
        <form onSubmit={handleSubmitAddAttribute(onAddNewAttribute)}>
            <div className={classes.editRow}>
                <TextField className={classes.newAttribName} placeholder='Name' name='name' inputRef={registerAddAttribute({
                    required: 'Attribute name is required',
                    validate: value => {
                        console.log('validate ', value, doc.thing[value] )
                        return !doc.thing[value] || 'Attribute name must be uniqe'
                    }
                })}
                helperText={errors.name?.message}
                error={ errors.name ? true : false }
                />
                <TextField className={classes.newAttribValue} placeholder='Value' name='value' inputRef={registerAddAttribute}/>
                <IconButton aria-label="add" type='submit'>
                    <Icon>add_circle</Icon>
                </IconButton>
            </div>
        </form>

    <Button variant="contained" color="primary" type='button' onClick={handleSubmit(onSave)}>
    Save
    </Button>
</>
    )
}

function EditDocChildren( { doc, dbKey }) {

    const { register, handleSubmit, reset, errors} = useForm()
    

    const onAddCollection = (data) => {
        try {
            console.log("onAddCollection", data.newCollection)
            addCollection(dbKey, data.newCollection)
            console.log('reset newCollection')
            reset({ newCollection: '' })
            
        } catch(error) {
            console.log("onAddCollection, error", error, data.newCollection)
        }
    }
    
    const onDelete = (name) => {
        try {
            console.log("onDelete, name:", name)
            deleteCollection(dbKey, name)
            
        } catch(error) {
            console.log("onDelete, error", error, name)
        }
    }

    return (
        <form> 
            {doc?.meta?.children && doc.meta.children.map((name, index) => 
                <div key={index}>
                {name} 
                <IconButton aria-label="delete" onClick={() => onDelete(name)}>
                    <DeleteIcon />
                </IconButton>
            </div>
            )}
            
            <TextField name='newCollection' label="New collection" inputRef={register({
                validate: value => {
                        console.log('validate ', value, doc.meta.children )
                        if(value === 'meta') {
                            return false
                        }
                        if(doc?.meta?.children) {
                            return !doc?.meta?.children.some( child => value === child ) || 'Child name must be uniqe'
                        }
                        return true
                    }
                })}
                helperText={errors.name?.message}
                error={ errors.name ? true : false }/>
            <IconButton aria-label="add" onClick={handleSubmit(onAddCollection)}>
                <Icon>add_circle</Icon>
            </IconButton>
        </form>
    )
}
function toDocumentId(path) {
    if (path.length % 2 === 0) {
        return path.slice(path.length - 1)
    } else {
        return null
    }
}

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