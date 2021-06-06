import React, { useEffect } from "react";
import {
  AppBar,
  Box,
  makeStyles,
  Tab,
  Tabs,
  useTheme,
} from "@material-ui/core";
import { createThing, updateThing } from "../../firebase/storage";
import { useSnackbar } from "notistack";
import { useWorkspace } from "../../components/workspace/useWorkspace";
import AttributesManualEditor from "./AttributesManuelEditor";
import { useEditor } from "../useEditor";
import DocumentEditor from "./DocumentEditor";
import DocumentViewer from "./DocumentViewer";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

function DocumentView() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const {
    editing,
    createDocument,
    collectionId,
    documentId,
    document,
    setDocumentId,
    setDocument,
    setCreateDocument,
  } = useEditor();
  const { wid, tenantId } = useWorkspace();

  const onSaveThing = async (thing) => {
    try {
      let docId = documentId ? documentId : thing.id;
      if (thing.id) {
        delete thing.id;
      }
      console.log("onSaveThing", thing, collectionId, documentId, docId);
      if (createDocument) {
        const ref = await createThing(
          tenantId,
          wid,
          collectionId,
          docId,
          thing
        );
        setCreateDocument(false);
      } else {
        await updateThing(tenantId, wid, collectionId, docId, thing);
      }
      setDocumentId(null);
      setDocument(null);

      enqueueSnackbar(`${docId} was saved`, { variant: "success" });
    } catch (error) {
      console.log("onSave, error", error);
      enqueueSnackbar(`Failed to save`, { variant: "error" });
    }
  };

  return (
    <>
      <h2>
        {createDocument && "Create a Thing"}
        {!createDocument && documentId}
      </h2>

      {editing ? (
        <DocumentEditor />
      ) : (
        <DocumentViewer />
      )}
    </>
  );
}

function EditAttributes({ create, doc, onSaveThing, schema }) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Manuell" {...a11yProps(0)} />
          {/* <Tab label="By schema" {...a11yProps(1)} /> */}
          <Tab label="Raw" {...a11yProps(2)} />
        </Tabs>
      </AppBar>

      <TabPanel value={value} index={0} dir={theme.direction}>
        <AttributesManualEditor
          doc={doc}
          onSaveThing={onSaveThing}
          create={create}
        />
      </TabPanel>
      <TabPanel value={value} index={2} dir={theme.direction}>
        TODO edit by Json
      </TabPanel>
    </>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export default DocumentView;
