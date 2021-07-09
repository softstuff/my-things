import React from 'react'
import Editor from '../editor/Editor'
import {EditorProvider} from '../editor/useEditor'

const EditorPage = () => {
    return <>
        <EditorProvider>
            <Editor />
        </EditorProvider>
    </>
}

export default EditorPage