import { Button, Checkbox, Chip, FormControlLabel, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useEffect } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { useWizzard } from "./useWizzard";

export function HowPanel() {
  const { state } = useWizzard();
  return (
    <>
      <h2>How</h2>
      {state.type === "CSV" && <CsvConfig />}
    </>
  );
}

const CsvConfig = () => {
  const { state, dispatch } = useWizzard();
  const { formState, control, watch } = useForm({
    mode: "onChange",
  });
  const { isValid } = useFormState({ control });
  const values = watch();
  useEffect(() => {
      if(isValid !== state.step.done_1 || JSON.stringify(values) !== JSON.stringify( state.config)) {
        dispatch({type: "SET_CONFIG", values, isValid})
      }
  }, [isValid, values]);

   return (
    <form>
      <Controller
        name={"delimiter"}
        control={control}
        defaultValue={state.config?.delimiter || ";"}
        rules={{ required: "Select the columns delimiter" }}
        render={({ field, fieldState:{invalid, error} }) => (
          <TextField 
            label="Delimiter" {...field} 
            helperText={error?.message}
            error={invalid}/>
        )}
      />

      <Controller
        name="columns"
        control={control}
        defaultValue={["firstname", "lastname"]}
        rules={{ required: "Select the columns of the import file" }}
        render={({ field, fieldState:{invalid, error} }) => (
          <Autocomplete
            {...field}
            onChange={(_, value)=>field.onChange(value)}
            multiple
            freeSolo
            label="Delimiter"
            options={[]}
            // defaultValue={[]}
            autoSelect={true}
            renderTags={(value, getTagProps) =>
             value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => <TextField {...params} label="Columns" 
            helperText={error?.message}
            error={invalid}
            />}
          />
        )}
      />

      <Controller
        name={"hasHeader"}
        control={control}
        defaultValue={state.config?.hasHeader || true}  
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox    
                {...field}
                checked={field.value}
                color="primary"
              />
            }
            label="File have a header row"
          />
        )}
      />
    </form>
  );
};
