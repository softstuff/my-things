import { createContext, useContext } from "react"

export const ImportConfigContext = createContext()

export const useImportConfig = () => {
    const context = useContext(ImportConfigContext)
    return { config: context.config, setConfig: context.setConfig, activeStep: context.activeStep }
}

