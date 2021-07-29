import { Box, Fab, FormControl, Select, makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { SortAlphabeticalAscending, SortAlphabeticalDescending } from 'mdi-material-ui'
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from 'notistack';
import { FilterProvider, useFilter } from "./useFilter";
import { FormHelperText } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    item: {
        margin: theme.spacing(1),
        width: '25ch',
    },
}));

const Filter = ({ propertyNames, onFilterChange }) => {
    return (
        <FilterProvider>
            <FilterCard propertyNames={propertyNames} onFilterChange={onFilterChange} />
        </FilterProvider>
    )
}

const FilterCard = ({ propertyNames, onFilterChange }) => {
    const { state, setSuggestedProperties } = useFilter();

    useEffect(() => {
        if (propertyNames.length > 0) {
            setSuggestedProperties(propertyNames)
            
        }
    }, [propertyNames, setSuggestedProperties])

    useEffect(() => {
        onFilterChange(state)
    }, [onFilterChange, state])


    return (
        <Box display="flex" flexDirection="column">
            <Filters />
            <CreateFilter />
            <OrderBy />
        </Box>
    )
}

const CreateFilter = () => {
    const classes = useStyles()
    const { state, addFilter } = useFilter();
    const { enqueueSnackbar } = useSnackbar();

    const { handleSubmit, reset, control } = useForm({ defaultValues: { property: "", operator: "", value: "" } })

    const onSubmit = (filter) => {
        try {
            addFilter(filter)
            
            reset()

        } catch (error) {
            console.log("AddToSearch, error", error, filter)
            enqueueSnackbar(`Failed to add filter`, { variant: 'error' })
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <Box display="flex" flexDirection="row">
                <Controller

                    name={"property"}
                    control={control}
                    rules={{ required: "Select filter property" }}
                    render={({ field, fieldState: { invalid, error } }) => (
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={state.propertyNames}
                            onChange={(event, newValue) => {
                                field.onChange(newValue);
                            }}
                            value={field.value}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    className={classes.item}
                                    label="Property"
                                />
                            )}
                        />
                    )}
                />
                <Controller
                    name={"operator"}
                    control={control}
                    rules={{ required: "Select filter operator" }}
                    render={({ field, fieldState: { invalid, error } }) => (
                        <TextField
                            select
                            className={classes.item}
                            label="Operator" {...field}
                            helperText={error?.message}
                            error={invalid}>
                            {state.selectableOperators.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />
                <Controller
                    name={"value"}
                    control={control}
                    rules={{ required: "Select filter value" }}
                    render={({ field, fieldState: { invalid, error } }) => (
                        <TextField
                            className={classes.item}
                            label="Value" {...field}
                            helperText={error?.message}
                            error={invalid} />
                    )}
                />

                <Fab color="primary" aria-label="add" onClick={handleSubmit(onSubmit)}>
                    <AddIcon />
                </Fab>
            </Box>
        </form>
    )
}

const OrderBy = () => {
    const classes = useStyles()
    const { state, toggleSortDirection, setOrderByProperty } = useFilter();

    const onChange = e => {
        setOrderByProperty(e.target.value)
    }
    
    if(!state.sortablePropertys || state.sortablePropertys.length === 0) {
        return <div>Sorting is not supported for this filter</div>
    }

    return (
        <Box display="flex" flexDirection="row">

        <FormControl className={classes.item}>
            <Select
                labelId="order-by-label"
                id="order-by-select"
                displayEmpty
                value={state.orderByProperty}
                onChange={onChange}
                >
                    <MenuItem value="" >Item id</MenuItem>
                    {state.sortablePropertys.map(prop => (
                        <MenuItem key={prop} value={prop}>{prop}</MenuItem>
                    ))}
            </Select>
            <FormHelperText>Order by</FormHelperText>
        </FormControl>
        
        {state.orderByProperty && (
            <Fab aria-label="order by direction" onClick={toggleSortDirection}>
                {state.orderByDirection === "asc" ? <SortAlphabeticalAscending /> : <SortAlphabeticalDescending />}
            </Fab>
        )}

            
        </Box>
    )
}
const Filters = () => {
    const classes = useStyles()
    const { state, removeFilter } = useFilter();

    const onRemove = index => {
        removeFilter(index)
    }

    return (
        <div>
            {state.filters.map((filter, index) => (
                <Box key={index} display="flex" alignItems="center">
                    <Typography variant="subtitle1" className={classes.item}>
                        {filter.property} {filter.operator} {filter.value}
                    </Typography>
                    <Fab aria-label="delete" onClick={() => onRemove(index)}>
                        <DeleteIcon />
                    </Fab>
                   
                </Box>
            ))}
        </div>
    )
}

export default Filter