import {
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useEffect } from "react";
import { useWizzard } from "./useWizzard";
import isEmpty from "lodash/isEmpty";
import LineNavigator from "line-navigator";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    maxWidth: "50rem"
  },
  columns: {
    display: "flex",
    marginTop: "2rem",
    marginBottom: "3rem",
  },
  column: {
    marginRight: "1rem",
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
      {state.type === "CSV" && <CsvConfig />}
    </>
  );
}

const CsvConfig = () => {
  const classes = useStyles();
  const { state, dispatch } = useWizzard();

  useEffect(() => {
    if (!state.config) {
      const headerRow = state.testLines ? state.testLines[0] : "id;first name;last name";
      const separator = ";"
      const columns = splitRow(headerRow, separator)
      const values = {
        headerRow, separator, columns,
        encoding: "UTF-8",
        extentions: [".csv", ".txt"]
      };
      dispatch({ type: "SET_CONFIG", values, isValid: true });
    }
  }, [state.config, dispatch]);

  const handleChangeHeaderRow = (e) => {
    const headerRow = e.target.value;
    const separator = state.config.separator || ";";
    const columns = splitRow(headerRow, separator)
    const guessSeparators = headerRow.match(/[,|;]/);
    const guessSeparator = guessSeparators ? guessSeparators[0] : ";";
    const guessColumns =
      headerRow.split(guessSeparator).filter((col) => !isEmpty(col)) || [];

    if (guessColumns.length > columns.length) {
      const isValid = columns.length > 0;
      const values = {
        headerRow,
        separator: guessSeparator,
        columns: guessColumns,
      };
      dispatch({ type: "SET_CONFIG", values, isValid });
    } else {
      const isValid = columns.length > 0;
      const values = { ...state.config, headerRow, separator, columns };
      dispatch({ type: "SET_CONFIG", values, isValid });
    }
  };

  const splitRow = (row, separator) =>
      row.split(separator).filter((col) => !isEmpty(col)) || [];

  const handleChangeSeparator = (e) => {
    const headerRow = state.config?.headerRow || "";
    const separator = e.target.value;
    const columns = splitRow(headerRow, separator)
    const isValid = columns.length > 0;
    const values = { ...state.config, headerRow, separator, columns };

    dispatch({ type: "SET_CONFIG", values, isValid });
  };

  const handleChangeEncoding = (e, newValue) => {
    const encoding = newValue?.encoding || "UTF-8";
    let testLines = state.testLines
    console.log("handleChangeEncoding", newValue, encoding)
    if (state.testFile) {
      const navigator = new LineNavigator(state.testFile, {encoding});

      navigator.readLines(0, 3, (err, index, lines, isEof, progress) => {
        testLines = lines
      })
    }
    console.log("File encoding ", encoding, "testLines", testLines);
    const values = { ...state.config, encoding };
    dispatch({ type: "SET_CONFIG", values, testLines, isValid: state.config.columns.length > 0 });
  };

  if (!state.config) {
    return <div>Loading default value</div>;
  }

  return (
    <>
      <div className={classes.container}>
        <FormGroup className={classes.headers}>
          <FormLabel component="legend">Enter header row</FormLabel>
          <TextField
            label="headers"
            value={state.config?.headerRow}
            onChange={handleChangeHeaderRow}
          />
        </FormGroup>

        <FormControl component="fieldset">
          <FormLabel component="legend">Separator</FormLabel>
          <RadioGroup
            aria-label="separator"
            name="separator"
            value={state.config?.separator}
            onChange={handleChangeSeparator}
            row
          >
            <FormControlLabel value="\t" control={<Radio />} label="Tab" />
            <FormControlLabel value="," control={<Radio />} label="Comma" />
            <FormControlLabel value=";" control={<Radio />} label="Semicolon" />
            <FormControlLabel value=" " control={<Radio />} label="Space" />
          </RadioGroup>
        </FormControl>

        <FormGroup className={classes.encoding}>
          <Autocomplete
            defaultValue={state.config.encoding || "utf8"}
            value={state.config.encoding || "utf8"}
            onChange={handleChangeEncoding}
            // style={{ maxwidth: 300 }}
            options={selectableEncodings}
            getOptionLabel={(option) => option.encoding || option}
            getOptionSelected={(option, value)=> option.encoding === value?.encoding || value}
            renderOption={(option) => (
              <>
                <span>{option.encoding}</span>
                {option.used && (<span>- {option.used}</span>)}
              </>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Expected file encoding"
                variant="outlined"
                helperText="If special characters gets imported incorrect this setting might save the day."
              />
            )}
          />
        </FormGroup>

        <div className={classes.columns}>
          {state.config?.columns?.map((column, index) => (
            <Card key={index} className={classes.column}>
              <CardContent>
                <div>Column {index + 1}</div>
                <div>
                  <strong>{column}</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {state.testLines && (
            <div >
              <p>Values from the test file:</p>
              {state.testLines
                  .filter(line => line.trim().length > 0)
                  .map((line, lineNo) => {
                const columns = line.split(state.config.separator)
                const result = columns.map((column, index) => (
                  <Card key={index} className={classes.column}>
                    <CardContent>
                      <div>Column {index + 1}</div>
                      <div>
                        <strong>{column}</strong>
                      </div>
                    </CardContent>
                  </Card>))
                return (
                    <div key={lineNo} className={classes.columns}>
                      {result}
                    </div>)

              }
            )}
            </div>
        )}
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
