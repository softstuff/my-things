import { List, ListItem, ListItemIcon, ListItemText, Button } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import DeleteIcon from '@mui/icons-material/Delete';

import React, { useEffect, useState } from "react";
import { useWorkspace } from "../components/workspace/useWorkspace"
import { useTable, useExpanded } from 'react-table'
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import MaUTable from "@mui/material/Table";

const useStyles = makeStyles((theme) => ({
    nameItem: {
        flexGrow: 1
    }
}))

const ImportList = ({onSelect, onEdit, onView, onUse, collectionId, editing}) => {
    const classes = useStyles()
    const {workspace} = useWorkspace()
    const [imports, setImports] = useState([])

    const data = React.useMemo(
        () => imports,
        [imports]
    )

    const columns = React.useMemo(
        () => [
            {
                // Build our expander column
                Header: () => null, // No header
                id: 'expander', // Make sure it has an ID
                Cell: ({ row }) => (
                    <span {...row.getToggleRowExpandedProps()}>
                        {row.isExpanded ? '👇' : '👉'}
                      </span>
                ),
                //
                // {
                //     // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                //     // to build the toggle for expanding a row
                //     console.log("Cell row", row )
                //     return row.canExpand ? (
                //         <span
                //             {...row.getToggleRowExpandedProps({
                //                 style: {
                //                     // We can even use the row.depth property
                //                     // and paddingLeft to indicate the depth
                //                     // of the row
                //                     paddingLeft: `${row.depth * 2}rem`,
                //                 },
                //             })}
                //         >
                //           {row.isExpanded ? '👇' : '👉'}
                //         </span>
                //         // <pre
                //         //     style={{
                //         //         fontSize: '10px',
                //         //     }}
                //         // >
                //         //     <code>{JSON.stringify({ values: row.values }, null, 2)}</code>
                //         //   </pre>
                //     ) : null
                // },
            },
            { Header: "Id", accessor: "id" },
            { Header: "Collection", accessor: "config.collectionId" },
            { Header: "Name", accessor: "config.name" },
            { Header: "Type", accessor: "config.type" },
        ],
        []
    )

    const renderRowSubComponent = React.useCallback(
        ({ row }) => {
            const importer = workspace.imports[row.values.id]
            return (<>
                <Button variant="contained" color="primary" onClick={()=>onView(importer)}>View</Button>
                <Button variant="contained" color="primary" onClick={()=>onEdit(importer)}>Edit</Button>
                <Button variant="contained" color="primary" onClick={()=>openImporter(importer)}>Use</Button>
                <Button
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                    startIcon={<DeleteIcon />}
                    onClick={()=>deleteImport(importer.id)}
                >
                    Delete
                </Button>
            </>)
        },
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        visibleColumns,
        state: { expanded },
    } = useTable(
        {
            columns,
            data,
        },
        useExpanded
    )

    useEffect(()=>{
        setImports(Object.keys(workspace.imports || [])
                        .filter(id => collectionId ? workspace.imports[id].collectionId === collectionId : true)
                        .map(id => ({ id, config: workspace.imports[id] }))
                        || [])
    }, [workspace, collectionId])

    const deleteImport = async (name) => {
        // console.log("Delete import named ", name)
        // await deleteWorkspaceField(`imports.${collectionId}.${name}`)
        // console.log("Deleted")
    }

    const openImporter = importer => {
        onUse(importer)
    }

    return (
        <>            
            {imports.length === 0 && (<p>No imports has been created, yet..</p>)}

            <List>
            {imports.map( importer => (
                <ListItem key={importer.id} >
                    <ListItemText primary={importer.config.collectionId} className={classes.typeItem} />
                    <ListItemText className={classes.nameItem} >{importer.config.name}</ListItemText>
                    <ListItemText primary={importer.config.type} className={classes.typeItem} />
                    <ListItemText primary={importer.config.lastRun || 'never'} className={classes.typeItem} />
                    <ListItemText primary={importer.config.lastStatus || '-'} className={classes.typeItem} />
                    <ListItemText className={classes.typeItem} >
                        <Button variant="contained" color="primary" onClick={()=>onSelect(importer)}>View</Button>
                    </ListItemText>
                    <ListItemText className={classes.typeItem} >
                        <Button variant="contained" color="primary" onClick={()=>openImporter(importer)}>Use</Button>
                    </ListItemText>

                    {editing && (
                    <ListItemIcon onClick={()=>deleteImport(importer.id)}>
                        <DeleteIcon />
                    </ListItemIcon>
                    )}
                </ListItem>
            ))}
            </List>


            <MaUTable {...getTableProps()}>
                <TableHead>
                    {headerGroups.map(headerGroup => (
                        <TableRow {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <TableCell {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row)
                        return (
                            <React.Fragment {...row.getRowProps()}>
                                <TableRow {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return (
                                            <TableCell {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                                {row.isExpanded ? (
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell colSpan={visibleColumns.length-1}>
                                            {renderRowSubComponent({ row })}
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </React.Fragment>
                        )
                    })}
                </TableBody>
            </MaUTable>

            <pre>
            <code>{JSON.stringify({ expanded: expanded }, null, 2)}</code>
          </pre>
        </>)
}

export default ImportList