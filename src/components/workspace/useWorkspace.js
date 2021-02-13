import { useContext } from "react"
import { WorkspaceContext } from "./WorkspaceProvider"

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext)

    return { wid: context?.wid, schema: context.workspace.schema, useWip: context.useWip }
}