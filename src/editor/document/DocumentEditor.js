import {
  Button,
  Collapse,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"
import DeleteIcon from "@material-ui/icons/Delete"
import AddIcon from "@material-ui/icons/Add"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useWorkspace } from "../../components/workspace/useWorkspace"
import { updateFields, deleteField } from "../../firebase/storage"
import { useEditor } from "../useEditor"
import jp from "json-pointer"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"
import AttributeEditor from "./AttributeEditor"
import { ExpandLess, ExpandMore } from "@material-ui/icons"

const useStyles = makeStyles((theme) => ({
  attribute: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  field: {
    flexGrow: "0",
    minWidth: "5rem",
  },
  value: {
    flexGrow: "1",
  },
  type: {
    flexGrow: "0",
    marginRight: "10px",
  },
  list: {
    listStyleType: "none",
    maxWidth: "18rem",
  },
  addItem: {},
  addLabel: {
    flexGrow: "0",
    marginLeft: "auto",
    marginRight: "36px",
  },
  expandIcon: {
    flexGrow: "0",
    minWidth: "2rem",
    textAlign: "center",
  },
  fab: {
    position: 'absolute',
    right: theme.spacing(8),
    bottom: theme.spacing(8)
}
}))

const DocumentEditor = () => {
  const { document } = useEditor()

  useEffect(() => {
    console.log("Edit ", document, Object.getOwnPropertyNames(document))
  }, [document])

  return (<AttributeViewer />)
}

const AttributeViewer = ({ pointer = "" }) => {
  const classes = useStyles()
  const { tenantId, wid } = useWorkspace()
  const { collectionId, documentId, document } = useEditor()
  const [fields, setFields] = useState([])
  const [openEdit, setOpenEdit] = useState(false)
  const [editAttribute, setEditAttribute] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState()

  useEffect(() => {
    console.log("View", document, pointer)
    const _value = jp.get(document, pointer)
    console.log("value", _value)
    console.log("attributes", Object.getOwnPropertyNames(_value))

    setFields(
      Object.getOwnPropertyNames(_value)
        .filter((field) => field !== "id")
        .map((field) => {
          const attributePointer = `${pointer}/${field}`
          const value = jp.get(document, attributePointer)
          const type = whatType(value)
          console.log("Got ", field, type, value, attributePointer)
          return { field, type, value, pointer: attributePointer }
        })
    )
  }, [pointer, document])

  const openEditor = (attribute) => {
    setEditAttribute(attribute)
    setOpenEdit(true)
  }

  const closeEditor = () => {
    setOpenEdit(false)
  }

  const handleDelete = async (field) => {
    console.log("Delete field", field)

    await deleteField(tenantId, wid, collectionId, documentId, field)
    console.log("Saved")
  }

  const handleAdd = () => {
    setEditAttribute(null)
    setOpenEdit(true)
  }
  const handleSave = async (field) => {
    console.log("Save field", field)

    for (const [key, value] of Object.entries(field)) {
      console.log(`Save field ${key}: ${value}`)
      await updateFields(tenantId, wid, collectionId, documentId, key, value)
    }
    setOpenEdit(false)
  }

  return (
    <>
      <List>
        {fields.map((attribute, index) => (
          <AtributeItem
            key={index}
            {...attribute}
            selected={selectedIndex === index}
            onEdit={() => openEditor(attribute)}
            onDelete={() => handleDelete(attribute.field)}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
        
      </List>
      <Fab color="primary" aria-label="add" className={classes.fab} onClick={handleAdd}>
            <AddIcon/>
        </Fab>

      <EditDialog
        field={editAttribute?.field}
        value={editAttribute?.value}
        type={editAttribute?.type}
        pointer={editAttribute?.pointer}
        open={openEdit}
        onSave={handleSave}
        onCancel={closeEditor}
      />
    </>
  )
}

const AtributeItem = (props) => {
  if(props.type === "array") {
    return (<ArrayListItem {...props} />)
  } else {
    return (<SimpleListItem {...props} />)
  }

}

const EditDialog = ({
  open,
  field,
  value,
  type,
  pointer,
  onSave,
  onCancel,
}) => {
  const methods = useForm({
    shouldUnregister: true,
  })

  useEffect(() => {
    console.log("open EditDialog with ", open, field, value, type, pointer)
    methods.reset()
    console.log("Done")
  }, [field, value, type, pointer])

  const handleClose = () => {
    console.log("Close edit, isDirty", methods.formState.isDirty)
    if (!methods.formState.isDirty) {
      onCancel()
    }
  }

  const handleSave = async (data) => {
    console.log("EditDialog.handleSave", data, pointer)
    onSave(data)
  }

  const handleCancel = () => {
    console.log("handleCancel")
    onCancel()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Edit</DialogTitle>
      <DialogContent>
        <form>
          <FormProvider {...methods}>
            <AttributeEditor field={field} type={type} value={value} />
          </FormProvider>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button color="primary" onClick={methods.handleSubmit(handleSave)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const SimpleListItem = ({selected, field, type, value, onEdit, onDelete, onSelect}) => {
  const classes = useStyles()
  return (
  <ListItem button selected={selected} onClick={onSelect}>
    <ListItemIcon className={classes.expandIcon}></ListItemIcon>
    <ListItemText className={classes.field}>
      <strong>{field}</strong>:
    </ListItemText>
    <ListItemText className={classes.value}>{value}</ListItemText>
    <ListItemText className={classes.type} onClick={onEdit}>
      <DisplayType type={type} />
    </ListItemText>
    <ListItemIcon aria-label="edit" onClick={onEdit}>
      <EditIcon />
    </ListItemIcon>
    <ListItemIcon aria-label="remove" onClick={onDelete}>
      <DeleteIcon />
    </ListItemIcon>
  </ListItem>)
}

const ArrayListItem = ({selected, pointer, field, type, value, onEdit, onDelete, onSelect}) => {
  const classes = useStyles()
  const [open, setOpen] = useState(true)
  const [array, setArray] = useState([])

  useEffect(()=>{
    console.log("ArrayListItem value", value)
    setArray( value?.map(value=>({ type: whatType(value), value})) || [])
  }, [value])

  useEffect(()=>{
    console.log("ArrayListItem array", array)
  }, [array])

  const toggleExpand = () => {
    setOpen(!open)
  }

  return (
    <>
  <ListItem button selected={selected} onClick={toggleExpand}>
    <ListItemIcon className={classes.expandIcon}>
    {open ? <ExpandLess /> : <ExpandMore />}
    </ListItemIcon>
    <ListItemText className={classes.field} onClick={toggleExpand}>
    <strong>{field}</strong>:
    </ListItemText>
    <ListItemText className={classes.value} onClick={toggleExpand}></ListItemText>
    <ListItemText className={classes.type} onClick={toggleExpand}>
      <DisplayType type={type} />
    </ListItemText>
    <ListItemIcon aria-label="edit" onClick={onEdit}>
      <EditIcon />
    </ListItemIcon>
    <ListItemIcon aria-label="remove" onClick={onDelete}>
      <DeleteIcon />
    </ListItemIcon>
    
  </ListItem>
  <Collapse in={open} timeout="auto" unmountOnExit>
    
    <List component="div" disablePadding>  
      {array.map((item, index)=>(
        <ListItem button className={classes.nested} key={index}>
          <ListItemText  className={classes.expandIcon}>
            {index}
          </ListItemText>
          <ListItemText className={classes.value}>
            {item.value}
          </ListItemText>
          <ListItemText className={classes.type}>
            <DisplayType type={item.type} />
          </ListItemText> 
          <ListItemIcon></ListItemIcon>         
          <ListItemIcon></ListItemIcon>         
        </ListItem>
      ))}
    </List>
</Collapse>
</>)
}

export const whatType = (value) => {
  if (value == null || value == undefined) {
    return "null"
  } else if (Array.isArray(value)) {
    return "array"
  } else if (isNaN(value)) {
    return "string"
  } else if (Number.isInteger(value)) {
    return "integer"
  } else {
    return "number"
  }
}

const DisplayType = ({type}) => {
  if(type === "string") return "(text)"
  if(type === "integer") return "(integer)"
  if(type === "number") return "(number)"
  if(type === "null") return "(nothing)"
  if(type === "array") return "(list)"

  return `oops ${JSON.stringify(type)}`
}

export default DocumentEditor