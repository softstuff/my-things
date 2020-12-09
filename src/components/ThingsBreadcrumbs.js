import React, { useState } from 'react'
import { Link, Breadcrumbs, TextField } from '@material-ui/core';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { useForm } from 'react-hook-form';

function ThingsBreadcrumbs({ path, onPathChange}) {

    const [manual, setManual] = useState(false)
    const { register, handleSubmit,setValue} = useForm()

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

    setValue('newPath', path.join('/'))
    


    const crums = path.map((element, index) => {
        const newPath = path.slice(0, index + 1)
        return (<Link color="inherit" key={index} onClick={() => onPathChange(newPath)}>{element}</Link>)
    });

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
                {crums}
                </Breadcrumbs>
            )}
            
        </div>
        )
}

export default ThingsBreadcrumbs