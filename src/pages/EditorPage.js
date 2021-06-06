import React from 'react'
import Editor from '../editor/Editor'
import {EditorProvider} from '../editor/useEditor'
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    editor: {
        backgroundColor: 'red',
        height: "100%"
    },
}))

const EditorPage = () => {
    const classes = useStyles()
    return <>
        <EditorProvider>
            <Editor />
            {/*<div className={classes.editor}>Editor</div>*/}
        </EditorProvider>
    </>
}

export default EditorPage