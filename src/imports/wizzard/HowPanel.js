import {
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  makeStyles, Paper,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useEffect } from "react";
import { useWizzard } from "./useWizzard";
import isEmpty from "lodash/isEmpty";
import {useForm} from "react-hook-form";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    maxWidth: "50rem"
  },
  columns: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  column: {
    padding: "1rem",
  },
  encoding: {
    marginTop: "2rem",
    marginBottom: "1rem",
  },
  headers: {
    marginTop: "2rem",
    marginBottom: "3rem",
  },
}));

export function HowPanel() {
  const { state } = useWizzard();
  return (
    <>
      <CsvConfig />
    </>
  );
}

const CsvConfig = () => {
  const classes = useStyles();
  const { state, dispatch } = useWizzard();
  const {register, formState: {errors}} = useForm()

  useEffect(() => {
    if (!state.how) {
      const rows = state.file.sample.split(/\r?\n/)
      const headerRow = rows[0]
      const guessSeparators = headerRow.match(/[,|;]/);
      const separator = guessSeparators ? guessSeparators[0] : ";";
      const columns = headerRow.split(separator)
      const values = { 
        headerRow, separator, columns, type: "CSV", headerOnFirstRow: true
      };
      dispatch({ type: "SET_HOW", values, isValid: isValid(values) });
    }
  }, [state.how, dispatch]);

  const handleChangeColumnHeaderChanged = (title, index) => {
    const columns = state.how.columns
    columns[index] = title
    const headerRow = columns.join(state.how.separator)
      const values = {
        ...state.how,
        columns,
        headerRow
      };
    dispatch({ type: "SET_HOW", values, isValid: isValid(values) })
  };

  const handleChangeSeparator = (e) => {
    const headerRow = state.how?.headerRow || ""
    const separator = e.target.value
    const columns =
      headerRow.split(separator).filter((col) => !isEmpty(col)) || []
    const values = { ...state.how, headerRow, separator, columns }
    dispatch({ type: "SET_HOW", values, isValid: isValid(values) })
  }

  const handleChangeHeaderOnFirstRow = (e) => {
    const headerOnFirstRow = e.target.value === 'true'
    if(headerOnFirstRow) {
      const rows = state.file.sample.split(/\r?\n/)
      const headerRow = rows[0]
      const columns = headerRow.split(state.how.separator)
      const values = {...state.how, headerOnFirstRow, headerRow, columns}
      dispatch({type: "SET_HOW", values, isValid: isValid(values)})
    } else {
      const values = {...state.how, headerOnFirstRow}
      dispatch({type: "SET_HOW", values, isValid: isValid(values)})
    }
  }

  const isValid = ({columns}) => {
    if(!columns || columns.lenght === 0){
      return false
    }
    return true
  }

  if (!state.how) {
    return <div>Loading default value</div>;
  }

  return (
    <>
      <div className={classes.container}>

        <FormControl component="fieldset">
          <FormLabel component="legend">Headers on first row</FormLabel>
          <RadioGroup
              aria-label="fHeader on first row"
              name="headerOnFirstRow"
              value={state.how.headerOnFirstRow.toString()}
              onChange={handleChangeHeaderOnFirstRow}
              row={true}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        {!state.how.headerOnFirstRow && (
            <div>
            {state.how?.columns?.map((column, index) => (
                <FormGroup key={index} className={classes.headers}>
                  <FormLabel component="legend">Title for column {index+1}</FormLabel>
                  <TextField
                      label="headers"
                      value={column}
                      onChange={(e) => handleChangeColumnHeaderChanged(e.target.value, index)}
                  />
                </FormGroup>
              ))}
            </div>
        )}

        <FormControl component="fieldset">
          <FormLabel component="legend">Separator</FormLabel>
          <RadioGroup
            aria-label="separator"
            name="separator"
            value={state.how?.separator}
            onChange={handleChangeSeparator}
            row
          >
            <FormControlLabel value="\t" control={<Radio />} label="Tab" />
            <FormControlLabel value="," control={<Radio />} label="Comma" />
            <FormControlLabel value=";" control={<Radio />} label="Semicolon" />
            <FormControlLabel value=" " control={<Radio />} label="Space" />
          </RadioGroup>
        </FormControl>

        <hr/>

        <div className={classes.columns}>
          {state.how?.columns?.map((column, index) => (
            <Paper key={index} className={classes.column} variant={"outlined"}>
                <div>Column {index + 1}</div>
                <div>
                  <strong>{column}</strong>
                </div>
            </Paper>
          ))}
        </div>
      </div>
    </>
  );
};

const selectableEncodings = [
  { encoding: "UTF-8", used: "Default" },
  
  { encoding: "windows-1250", used: "Czech, Hungarian, Polish, Romanian" },
  { encoding: "windows-1251", used: "Russian" },
  {
    encoding: "windows-1252",
    used: "Danish, Dutch, English, French, German, Italian, Norwegian, Portuguese, Swedish",
  },
  { encoding: "windows-1253", used: "Greek" },
  { encoding: "windows-1254", used: "Turkish" },
  { encoding: "windows-1255", used: "Hebrew" },
  { encoding: "windows-1256", used: "Arabic" },

  
  {
    encoding: "ISO-8859-1",
    used: "Danish, Dutch, English, French, German, Italian, Norwegian, Portuguese, Swedish",
  },
  { encoding: "ISO-8859-2", used: "Czech, Hungarian, Polish, Romanian" },
  { encoding: "ISO-8859-5", used: "Russian" },
  { encoding: "ISO-8859-6", used: "Arabic" },
  { encoding: "ISO-8859-7", used: "Greek" },
  { encoding: "ISO-8859-8", used: "Hebrew" },
  { encoding: "ISO-8859-9", used: "Turkish" },

  { encoding: "KOI8-R", used: "Russian" },
  { encoding: "IBM420", used: "Arabic" },
  { encoding: "IBM424", used: "Hebrew" },
  
  { encoding: "Shift_JIS", used: "Japanese" },
  { encoding: "ISO-2022-JP", used: "Japanese" },
  { encoding: "ISO-2022-CN", used: "Simplified Chinese" },
  { encoding: "ISO-2022-KR", used: "Korean" },
  { encoding: "GB18030", used: "Chinese" },
  { encoding: "Big5", used: "Traditional Chinese" },
  { encoding: "EUC-JP", used: "Japanese" },
  { encoding: "EUC-KR", used: "Korean" },

  { encoding: "UTF-16BE" },
  { encoding: "UTF-16LE" },
  { encoding: "UTF-32BE" },
  { encoding: "UTF-32LE" },
];
