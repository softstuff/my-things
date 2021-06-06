import { useEditor } from "../useEditor";

export default () => {
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