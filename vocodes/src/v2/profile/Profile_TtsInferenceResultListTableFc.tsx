import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { useTable, usePagination, } from 'react-table';

interface TtsInferenceResultListResponsePayload {
  success: boolean,
  results: Array<TtsInferenceResult>,
  cursor_next: string | null | undefined,
  cursor_previous: string | null | undefined,
}

interface TtsInferenceResult {
  tts_result_token: string,
  tts_model_token: string,
  raw_inference_text: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,

  file_size_bytes: number,
  duration_millis: number,

  created_at: string,
  updated_at: string,
}

interface Props {
  username: string,
}

// TODO: get rid of any binding
function Table({
  columns,
  data,
  fetchData,
  loading,
  pageCount: controlledPageCount,
} : any) {

  console.log(columns, data, fetchData, loading, controlledPageCount);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      //initialState: { pageIndex: 0 }, // Pass our hoisted table state
      //manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      //pageCount: controlledPageCount,
    },
    usePagination
  ) as any

  // Listen for changes in pagination and use the state to fetch our new data
  React.useEffect(() => {
    fetchData({ pageIndex, pageSize })
  }, [fetchData, pageIndex, pageSize])



  // Render the UI for your table
  return (
    <>
      <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
            },
            null,
            2
          )}
        </code>
      </pre>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup: any) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                  <span>
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row : any, i : any) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: any) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td>Loading...</td>
            ) : (
              <td>
                Showing {page.length} of ~{controlledPageCount * pageSize}{' '}
                results
              </td>
            )}
          </tr>
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  )

}




function ProfileTtsInferenceResultsListTableFc(props: Props) {
  const [w2lResults, setW2lResults] = useState<Array<TtsInferenceResult>>([]);
  const [loading, setLoading] = useState(false);

  
  const columns = React.useMemo(
    () => [
      {
        Header: 'Result Link',
        accessor: 'col1', // TODO: Can be function into data
      },
      {
        Header: 'Voice',
        accessor: 'col2',
      },
      {
        Header: 'Duration',
        accessor: 'col3',
      },
      {
        Header: 'Creation Date',
        accessor: 'col4',
      },
    ],
    []
  );

  const data = React.useMemo(
    () => [
      {
        col1: 'Hello',
        col2: 'World',
        col3: 'what',
        col4: 'ever',
      },
      {
        col1: 'react-table',
        col2: 'rocks',
        col3: 'what',
        col4: 'ever',
      },
      {
        col1: 'whatever',
        col2: 'you want',
        col3: 'what',
        col4: 'ever',
      },
    ],
    []
  );

  // TODO: Fix types here.
  const tableInstance = useTable({ columns : columns as any, data })

  const fetchData = React.useCallback(( { pageSize, pageToken } ) => {
    const api = new ApiConfig();
    const endpointUrl = api.listTtsInferenceResultsForUser(props.username);

    setLoading(true)

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : TtsInferenceResultListResponsePayload  = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lResults(templatesResponse.results)
      setLoading(false);
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

  }, []);


  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listTtsInferenceResultsForUser(props.username);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : TtsInferenceResultListResponsePayload  = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lResults(templatesResponse.results)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div>
      <Table data={data} columns={columns} loading={loading} fetchData={fetchData} />

      <table {...getTableProps()}>
        <thead>
          {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map(column => (
                // Apply the header cell props
                <th {...column.getHeaderProps()}>
                  {// Render the header
                  column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {// Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row)
            return (
              // Apply the row props
              <tr {...row.getRowProps()}>
                {// Loop over the rows cells
                row.cells.map(cell => {
                  // Apply the cell props
                  return (
                    <td {...cell.getCellProps()}>
                      {// Render the cell contents
                      cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

    </div>
  )
}

export { ProfileTtsInferenceResultsListTableFc };
