import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react'
import { useWorkspace } from '../../components/workspace/useWorkspace';
import { useUser } from '../../components/user/useUser'
import { getCollectionQueryRef } from '../../firebase/storage';
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useTable, usePagination } from 'react-table';
import { useEditor } from '../useEditor';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, makeStyles} from '@material-ui/core';
import Filter from './filter/Filter';

const useStyles = makeStyles((theme) => ({
  loadMore: {
      textAlign: 'center',
      marginTop: theme.spacing(1.5),
  },
}));

const DocumentList = () => {
  const classes = useStyles()
  const { collectionId } = useEditor()
  const [documentList, setDocumentList] = useState([])
  const [headers, setHeaders] = useState([])
  const [columnNames, setColumnNames] = useState([])
  const [lastDocument, setLastDocument] = useState()
  const [searchTerms, setSearchTerms] = useState([])
  const [queryRef, setQueryRef] = useState()
  const [onLastPage, setOnLastPage] = useState()


  const { enqueueSnackbar } = useSnackbar();
  const { wid } = useWorkspace()
  const { tenantId } = useUser()

  const data = React.useMemo(
    () => documentList,
    [documentList]
  )

  const columns = React.useMemo(
    () => headers,
    [headers]
  )

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 100 },
      manualPagination: true,
    },
    usePagination,
  )


  const {
    getTableProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex, pageSize},
  } = tableInstance

  const loadMore = useCallback( () => {
    const nextRef = queryRef.startAfter(lastDocument)
    setQueryRef(nextRef)
    nextRef.get()
    .then(snap => {
      const entitys = snap.docs.map(doc => ({ id:doc.id, item:doc.data()}))
      const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length -1] : undefined
      
      const _columnNames = [...new Set([...columnNames, ...entitys.flatMap(entity => Reflect.ownKeys(entity.item))])].sort()
      const _headers = _columnNames.map(header => ({ Header: header, accessor: `item.${header}` }))
      _headers.unshift({ Header: "ID", accessor: "id" })

      setHeaders(_headers)
      setLastDocument(lastDoc)
      setOnLastPage( entitys.length < pageSize)
      if(JSON.stringify(columnNames) !== JSON.stringify(_columnNames)) {
        setColumnNames(_columnNames)
      }
      setDocumentList([...documentList, ...entitys])

    })
    .catch( error => {
      console.log(`Failed to load documents for `, collectionId, error)
      enqueueSnackbar(`Failed to documents for ${collectionId}`, { variant: 'error' })
    })
  }, [collectionId, columnNames, documentList, enqueueSnackbar, lastDocument, pageSize, queryRef])


  useEffect(() => {
    let mounted = true
    if (!mounted) {
      console.log("Load was aborted")
      return
    }

    const _queryRef = getCollectionQueryRef(tenantId, wid, collectionId, searchTerms, pageSize)

    setQueryRef(_queryRef)
    _queryRef.get()
    .then(snap => {
      const entitys = snap.docs.map(doc => ({ id:doc.id, item:doc.data()}))
      const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length -1] : undefined
      
      const _columnNames = [...new Set(entitys.flatMap(entity => Reflect.ownKeys(entity.item)))].sort()
      const _headers = _columnNames.map(header => ({ Header: header, accessor: `item.${header}` }))
      _headers.unshift({ Header: "ID", accessor: "id" })

      setHeaders(_headers)
      setLastDocument(lastDoc)
      setOnLastPage( entitys.length < pageSize)
      if(JSON.stringify(columnNames) !== JSON.stringify(_columnNames)) {
        setColumnNames(_columnNames)
      }
      setDocumentList(entitys)

    })
    .catch( error => {
      console.log(`Failed to load documents for `, collectionId, error)
      enqueueSnackbar(`Failed to documents for ${collectionId}`, { variant: 'error' })
    })
  }, [tenantId, wid, collectionId, enqueueSnackbar, searchTerms, pageSize, pageIndex, columnNames])

  const handleLoadMore = () => {
    return loadMore()
  }

  return (
    <>

      <div style={{ height: 400, width: '100%' }}>

        <FilterBox propertyNames={columnNames} searchTerms={searchTerms} setSearchTerms={setSearchTerms}/>

        {rows.length === 0 && (<div>Empty result</div>)}

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
          <TableBody>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </MaUTable>


        {!onLastPage &&(
          <div className={classes.loadMore}>
            <Button color="secondary" onClick={handleLoadMore} disabled={onLastPage}>Load more</Button>
          </div>
        )}
      </div>
    </>
  );
}


const FilterBox = ({ propertyNames, searchTerms, setSearchTerms }) => {


  const handleFilterChange = useCallback(term => {
    setSearchTerms(term)
  }, [setSearchTerms])


  if (!propertyNames || propertyNames.length === 0) {
    return null
  }

  return (
    <Accordion>
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filter-content"
        id="filter-header"
      >
        <Typography>Filter</Typography>
      </AccordionSummary>
      <AccordionDetails>
          <Filter  propertyNames={propertyNames} onFilterChange={handleFilterChange} />
      </AccordionDetails>
    </Accordion>
  )
}


export default DocumentList