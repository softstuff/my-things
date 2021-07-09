import {
  FormControl,
  FormHelperText,
  InputLabel,
  makeStyles,
  NativeSelect,
  TextField,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import {
  useFormContext,
  Controller,
  useFieldArray,
} from "react-hook-form";
import {whatType} from "./DocumentEditor"

const useStyles = makeStyles((theme) => ({
  attribute: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  field: {
    flexGrow: "0",
    minWidth: "5rem",
  },
  value: {
    flexGrow: "1",
  },
  type: {
    flexGrow: "0",
    marginRight: "10px",
  },
  list: {
    listStyleType: "none",
    maxWidth: "18rem",
  },
  addItem: {},
  addLabel: {
    flexGrow: "0",
    marginLeft: "auto",
    marginRight: "36px",
  },
}));

const AttributeEditor = (props) => {
    const classes = useStyles();
    // const { watch, setValue, getValues, reset,unregister, control, formState: {errors, isDirty, touchedFields }} = useFormContext();
    const isNew = props.field === undefined;
    const [field, setField] = useState(props.field);
    const [type, setType] = useState(props.type || "string");
    
    useEffect(() => {
      console.log("AtributeEditor isNew", isNew);
    }, [isNew]);
    useEffect(() => {
      console.log("AtributeEditor type change", type);
    }, [type]);
  
    const showInline = () => {
      return ["string", "number", "integer", "null"].includes(type)
    }

    const handleFieldChange = newField => {
      console.log("handleFieldChange type: ", newField)
      setField(newField)
    }

    const handleTypeChange = newType => {
      console.log("handleTypeChange type: ", newType)
      setType(newType)
    }

    return (
      <>
        <div className={classes.attribute}>
          <FieldEditor value={field} onChange={handleFieldChange} disabled={!isNew} />
          <TypeSelector value={type} onChange={handleTypeChange} />
          
          {field && showInline() && <ValueEditorController fieldName={field} type={type} defaultValue={props.value} />}
          
        </div>
        <div>
          {field && type === "array" && <ArrayEditorController fieldName={field} type={type} defaultValue={props.value} />}
        </div>
      </>
    );
  };

  const FieldEditor = ({disabled, value, onChange}) => {

    useEffect(()=>{
      console.log("FieldEditor value", value)
    },[value])

    return (
      <TextField
      label="Add attribute"
      onChange={(e) => onChange(e.target.value)}
      value={value}
      required={true}
      InputProps={{ disabled }}
    />)
  }

  const TypeSelector = ({value, onChange}) => {

    useEffect(()=>{
      console.log("TypeSelector value", value)
    },[value])

    return (
      <FormControl>
          <InputLabel htmlFor="type" error={false}>
            Type
          </InputLabel>
  
          <NativeSelect
            label="Type"
            aria-describedby="type-helper-text"
            required={true}
            // onBlur={(e) => onChange(e.target.value)}
            onChange={(e) => onChange(e.target.value)}
            value={value}
          >
            <option value="">Select a type</option>
            <option value="string">Text</option>
            <option value="number">Number</option>
            <option value="integer">Integer</option>
            <option value="null">Null</option>
            <option value="array">List</option>
          </NativeSelect>
          <FormHelperText id="type-helper-text" error={false}></FormHelperText>
        </FormControl>
      )
  }
  
  const ValueEditorController = ({ fieldName, type, defaultValue }) => {
    const {control} = useFormContext()

    useEffect(()=>{
      console.log("ValueEditorController type:", type, " defaultValue", defaultValue)
    },[type, defaultValue])

    return (
      <>
        
        <Controller
          name={fieldName}
          control={control}
          defaultValue={defaultValue}
          render={({ field, fieldState, formState}) => (
            <ValueEditor field={field} fieldState={fieldState} formState={formState} type={type} value={defaultValue} />
          )}
        />
      </>
    );
  };

  const ValueEditor = ({ field, fieldState, formState, type, value }) => {

    // useEffect(()=>{
    //   console.log("ValueEditor type:", type, " value", value, "field.value", field.value)
    // },[field, value])

    return (
      <>
        {type === "string" && (
          <StringEditor value={value} renderField={field} />
        )}
        {type === "number" && (
          <NumberEditor renderField={field} formState={fieldState}/>
        )}
        {type === "integer" && (
          <IntegerEditor renderField={field} formState={fieldState} />
        )}
        {type === "map" && (
          <MapEditor value={value} renderField={field} />
        )}
        {type === "null" && (
          <NullEditor renderField={field} />
        )}
      </>
    );
  };
  
  const StringEditor = ({ field, value = "", renderField }) => {
    const {
      formState: { errors },
    } = useFormContext();
  
    useEffect(() => {
      console.log("StringEditor field", field)
    }, [field]);

    useEffect(()=>{
      console.log("StringEditor value", value)
    },[value])
  
    return (
      <TextField
        label="Value"
        {...renderField}
        helperText={errors.value?.message}
        error={errors.value ? true : false}
      />
    );
  };
  
  const NumberEditor = ({renderField, formState }) => {
        
    return (
      <TextField
        label="Value"
        value={renderField.value}
        onChange={(e)=>{renderField.onChange(e.target.valueAsNumber)}} 
        helperText={formState.errors?.value?.message}
        error={formState.errors?.value ? true : false}
        type="number"
        step="any"
      />
    );
  };
  
  const IntegerEditor = ({renderField, formState }) => {
    
    
    return (
      <TextField
        label="Value"
        value={renderField.value}
        onChange={(e)=>{renderField.onChange(e.target.valueAsNumber)}} 
        helperText={formState.errors?.value?.message}
        error={formState.errors?.value ? true : false}
        type="number"
        step="1"
      />
    );
  };
  
  const ArrayEditorController = ({ fieldName, defaultValue }) => {

    const {control} = useFormContext()
    const { fields, append, remove} = useFieldArray(
      {
        control,
        name: fieldName,shouldUnregister: true
      }
    );
  
    useEffect(() => {
      console.log("ArrayEditorController fieldName", fieldName," defaultValue", defaultValue)
      // append([{[fieldName]: "Stina"} , {[fieldName]: "Maggan"}]);
      if(Array.isArray(defaultValue)) {
        const fieldArray = defaultValue.map(v=>({[fieldName]: v}))
        console.log("Appending ", defaultValue, "as", fieldArray)
        append(fieldArray)
      }
  
    }, [fieldName, defaultValue]);
  
    const addNew = (e) => {
      append("")
      e.preventDefault();
    }
    const deleteMe = (index) => {
      remove(index);
    };
  
    return (
      <div>
        List of size {fields.length}
        <ul>
          {fields &&
            fields.map((field, index) => (
              <li key={field.id}>
                <ArrayItem fieldName={`${fieldName}.${index}`} value={field[fieldName]} />
                <button type="button" onClick={() => deleteMe(index)}>
                  Delete {index}
                </button>
              </li>
            ))}
          <li>
            <button onClick={addNew}>
              Add
            </button>
          </li>
        </ul>
      </div>
    );
  };

  const MapEditor = ({ field, value }) => {
    return (
      <>
      ToDo
      </>
    )
  }

  const NullEditor = ({ renderField }) => {
    const {setValue} = useFormContext()
    useEffect(()=>{
      setValue(renderField.name, null)
      console.log("NullEditor renderField", renderField.value)
    },[renderField])

    return null
  }

  const ArrayItem = ({fieldName, value}) => {
    const [type, setType] = useState("string")

    useEffect(()=>{
      console.log("ArrayItem fifieldNameeld", fieldName, "value", value)
    },[fieldName, value])

    useEffect(()=>{
      console.log("ArrayItem type", type)
    },[type])

    useEffect(()=>{
      console.log("ArrayItem type", type, value)
      if(value) {
        setType(whatType(value))
      }
    },[value])


    return (
      <>
        <TypeSelector value={type} onChange={setType} />
        <ValueEditorController fieldName={fieldName} type={type} defaultValue={value} />
      </>
    )
  }

  
  export default AttributeEditor