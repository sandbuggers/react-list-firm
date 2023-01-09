import React from "react";
// import firmsData from "./firms.json";
import "./App.css";
import axios from 'axios';

import {
  useTable,
  useFilters,
  useGlobalFilter
} from "react-table";
import {matchSorter} from 'match-sorter';

class App extends React.Component {
  async getData() {
    const res = await axios.get('firms.json');
    return await res.data;
  }

  constructor(props) {
    super(props);
    this.state = { data: null }
  }

  componentDidMount() {
    if (!this.state.data) {
      (async () => {
        try {
          this.setState({ data: await this.getData() });
        } catch (error){
          console.log(error);
        }
      })();
    }
  }

  render() {
    if (!this.state.data) {
      return (<div><h1>FIRMS</h1>loading...</div>)
    }
    console.log(this.state.data);
    return (
      <div className="App">
        <h1>FIRMS</h1>
        <FirmTable data={this.state.data} />
      </div>
    );
  }
}

function FirmTable({data}) {
  const memoData = React.useMemo(() => data, []);
  const columns = React.useMemo(
    () => [
      {
        Header: "Firm Name",
        accessor: "firmName",
        filter: "fuzzyText"
      },
      {
        Header: "State",
        accessor: "state",
        Filter: SelectColumnFilter,
        filter: "includes"
      },
      {
        Header: "Users",
        accessor: "numberOfUsers",
        Filter: NumberRangeColumnFilter,
        filter: "between"
      },
      {
        Header: "Status",
        accessor: "statusDescription",
        Filter: SelectColumnFilter,
        filter: "includes"
      },
      {
        Header: "Flag",
        accessor: row => (row.isTestFirm ? "Test Firm" : "Non-Test"),
        Filter: SelectColumnFilter,
        filter: "includes"
      }
    ], 
    []
  );
  console.log(data);
  return (
    <FilteredFirmTable columns={columns} data={memoData} />
  );
}

// Define a default UI for filtering
// From https://react-table-v7.tanstack.com/docs/examples/filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

// This is a custom filter UI for selecting
// a unique option from a list
// From https://react-table-v7.tanstack.com/docs/examples/filtering
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id }
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// This is a custom UI for a 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
// From https://react-table-v7.tanstack.com/docs/examples/filtering
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div
      style={{
        display: "flex"
      }}
    >
      <input
        value={filterValue[0] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            val ? parseInt(val, 10) : undefined,
            old[1]
          ]);
        }}
        placeholder={`Min (${min})`}
        style={{
          width: "70px",
          marginRight: "0.5rem"
        }}
      />
      to
      <input
        value={filterValue[1] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? parseInt(val, 10) : undefined
          ]);
        }}
        placeholder={`Max (${max})`}
        style={{
          width: "70px",
          marginLeft: "0.5rem"
        }}
      />
    </div>
  );
}


function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val

function FilteredFirmTable({columns, data}) {
  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn, 
      filterTypes,
    },
    useFilters,
    useGlobalFilter 
  )

  // temp: limit rendered rows
  const firstPageRows = rows.slice(0, 10);

  return (
    <div>
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>
                {column.render('Header')}
                {/* Render filter if exists*/}
                <div>{column.canFilter ? column.render('Filter') : null}</div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {/* temp: change to "rows" to render all */}
        {firstPageRows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
    <br/>
    {/* show filters for debugging */}
    <div>
        <pre>
          <code>{JSON.stringify(state.filters, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}

export default App;
