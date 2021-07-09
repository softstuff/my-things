import React from "react";
import { useEditor } from "../useEditor";
import DocumentEditor from "./DocumentEditor";
import DocumentViewer from "./DocumentViewer";


function DocumentView() {
  const {
    editing,
    createDocument,
    documentId,
  } = useEditor();
  
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
