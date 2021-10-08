import {
    Card,
    CardContent,
    Radio,
    FormControlLabel,
    Typography,
    RadioGroup,
    Select,
    TextField, FormControl, Box, InputLabel, NativeSelect, FormHelperText, MenuItem, IconButton,
} from "@mui/material";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import DeleteIcon from '@mui/icons-material/Delete';
import makeStyles from '@mui/styles/makeStyles';
import Autocomplete from '@mui/material/Autocomplete';

import React, { useEffect } from "react";
import { useWorkspace } from "../../components/workspace/useWorkspace";
import { useWizzard } from "./useWizzard";
import { Controller, useFieldArray, useForm, useFormContext, FormProvider } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

const useStyles = makeStyles(() => ({
    container: {},
    containerXX: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        minHeight: "40vh",
    }
}))

export function ToPanel() {
    const classes = useStyles()
    const { state, dispatch } = useWizzard()
    const { workspace } = useWorkspace()

    // useEffect(()=>{
    //   dispatch({type: "SET_TYPE", value: state.type, isValid: state.type !== null})
    // },[dispatch, state.type])

    // const handleChangeType = event => {
    //   console.log("handleChangeType ", event.target.name, event.target.value, event.target.checked)
    //   const newType = event.target.value
    //   dispatch({type: "SET_TYPE", value: newType, isValid: state.type !== null})
    // }

    const handleStructureSelect = name => {
        const create = !workspace.collections.includes(name)
        let properties = []
        if (create && state.type === "CSV") {
            properties = state.config.columns.map(name => ({ name, type: "text" }))
        }

        dispatch({ type: "SET_STRUCTURE", payload: { name, create, properties } })
    }

    if (!workspace.collections || workspace.collections.length === 0) {
        return <CreateNewStructure />
    }

    return (
        <>
            Select or create structure
            <div className={classes.container}>
                <Autocomplete
                    options={workspace?.collections}
                    renderInput={(params) => (
                        <TextField {...params} label="Structure name" margin="normal" variant="outlined" />
                    )}
                    onChange={(_, value) => handleStructureSelect(value)}
                    value={state.structure?.name}
                />

                {state.structure?.name && (<p>Nice
                    lets {state.structure?.create ? "create a new" : "use"} structure {state.structure?.name}</p>)}


            </div>
        </>
    );
}

const CreateNewStructure = ({ }) => {
    const classes = useStyles()
    const { state } = useWizzard()
    const methods = useForm();
    const { control, register, handleSubmit } = methods;
    const { fields, replace, append, remove, move } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: "fields", // unique name for your Field Array
        // keyName: "id", default to "id", you can change the key name
    });

    useEffect(() => {
        console.log("Load columns", state.how.columns.map(column => ({ name: column, type: 'text' })))

        replace(state.how.columns.map(column => ({ name: column, type: 'text' })))
    }, [])

    const createStructure = structur => {
        console.log("Create structure", structur)
    }

    return (<>
        <p>Create a new structure</p>

        <form onSubmit={handleSubmit(createStructure)}>
            <FormProvider {...methods} >
                <FormControl sx={{ mx: "auto", mb: "2rem" }}>
                    <Controller
                        name={"name"}
                        control={control}
                        rules={{ required: "Select the a name" }}
                        render={({ field, fieldState: { invalid, error } }) => (
                            <TextField
                                label="Structure name" {...field}
                                variant="standard"
                                helperText={error?.message}
                                error={invalid} />
                        )}
                    />
                </FormControl>

                <Typography sx={{ mb: "2rem" }}>Attributes</Typography>

                {fields.map((field, index) => (
                    <Box key={field.id} display={"flex"} flexDirection={"row"} gap={"2rem"}>
                         <FormControl>
                            <input
                                {...register("key")}
                                type="radio"
                                name="weather"
                                value={index}
                            />
                        </FormControl>
                          
                        <AttributeEditor index={index} />

                        <FormControl>
                            <IconButton aria-label="Move down" onClick={() => move(index, index - 1)} disabled={index === 0}>
                                <ArrowCircleUpIcon />
                            </IconButton>
                        </FormControl>
                        <FormControl>
                            <IconButton aria-label="Move down" onClick={() => move(index, index + 1)} disabled={index + 1 === fields.length}>
                                <ArrowCircleDownIcon />
                            </IconButton>
                        </FormControl>
                        <FormControl>
                            <IconButton aria-label="delete" onClick={() => remove(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </FormControl>
                    </Box>
                ))}

                <div>
                    <button onClick={() => append({ name: "", type: "text" })}>Add</button>
                </div>


                <div>
                    <button type="submit">Create structure</button>
                </div>
            </FormProvider>
        </form>

        {/*<DevTool control={control} /> /!* set up the dev tool *!/*/}

    </>)
}

const AttributeEditor = ({ index }) => {
    const { register, control } = useFormContext();

    return (
        <>
            <FormControl sx={{ mx: "auto", mb: "2rem" }}>
                <Controller
                    name={`fields.${index}.name`}
                    control={control}
                    rules={{ required: "Select a attribute name" }}
                    render={({ field, fieldState: { invalid, error } }) => (
                        <TextField
                            label="Name" {...field}
                            variant="standard"
                            helperText={error?.message}
                            error={invalid} />
                    )}
                />
            </FormControl>



            <Controller
                name={`type`}
                control={control}
                rules={{ required: "Select a attribute type" }}
                render={({ field, fieldState: { invalid, error } }) => (
                    <FormControl sx={{ width: "10rem" }}>
                        <InputLabel id={`type_label`} error={error}>
                            Type
                        </InputLabel>
                        <Select
                            labelId={`fields.${index}.type_label`}
                            aria-describedby="type-error-text"
                            label="Type"
                        >
                            <MenuItem value="">Select a type</MenuItem>
                            <MenuItem value="string">Text</MenuItem>
                            <MenuItem value="number">Number</MenuItem>
                            <MenuItem value="integer">Integer</MenuItem>
                            <MenuItem value="null">Null</MenuItem>
                            <MenuItem value="array">List</MenuItem>
                        </Select>
                        <FormHelperText id="type-error-text" error={error}>{invalid}</FormHelperText>
                    </FormControl>
                )}
            />

        </>
    )
}