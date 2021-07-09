import { useEditor } from "../useEditor";

const DocumentViewer = () => {
    const { document } = useEditor();

    return (
    <>
    {Object.getOwnPropertyNames(document)
      .filter((key) => key !== "id")
      .map((attib) => (
        <div key={attib}>
          {attib} = {document[attib]}
        </div>
      ))}
  </>)
}

export default DocumentViewer