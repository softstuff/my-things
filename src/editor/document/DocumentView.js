import React from "react";
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
  const { enqueueSnackbar } = useSnackbar();
  const {
    editing,
    createDocument,
    collectionId,
    documentId,
    setDocumentId,
    setDocument,
    setCreateDocument,
  } = useEditor();
  const { wid, tenantId } = useWorkspace();

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

export default DocumentView;
