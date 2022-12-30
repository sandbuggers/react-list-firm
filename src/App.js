import React from "react";
import ReactDOM from "react-dom/client";
import firmsData from "./firms.json";
import "./App.css";

import {
  useTable
} from "react-table";

function App() {
  return (
    <div className="App">
      <h1>FIRMS</h1>
      <FilterableFirmTable />
    </div>
  );
}

class FilterableFirmTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      states: [""],
      status: [""],
      flags: [""]
    }
  }

  render() {
    return (
      <div>
        <UserInput onSearchUpdate={(i) => this.setState({searchValue: i})}/>
        <FirmTable />
        <h3>SearchValue: {this.state.searchValue}</h3>
      </div>
    )
  };

}

class UserInput extends React.Component {
  render() {
    return (
      <div>
        <label for="search">Search</label>
        <input type="search" id="search-box" name="search-box" 
        onChange={event => this.props.onSearchUpdate(event.target.value)}/>
        <label for="states-select">States</label>
        <select id="states-select" name="states-select" multiple>
          <option value="">All States</option>
          <option>NSW</option>
          <option>SA</option>
          <option>QLD</option>
          <option>WA</option>
          <option>VIC</option>
          <option>TAS</option>
        </select>
        <label for="status-select">Status</label>
        <select id="status-select" name="status-select" multiple>
          <option value="">All Status</option>
          <option>Enabled</option>
          <option>Disabled</option>
        </select>
        <label for="flags-select">Flags</label>
        <select id="flags-select" name="flags-select" multiple>
          <option value="">All Flags</option>
          <option>Test Firm</option>
          <option>Non-Test</option>
        </select>{" "}
      </div>
    );
  }
}




function FirmTable() {
  const data = [...firmsData];
  const columns = React.useMemo(
    () => [
      {
        Header: "Firm Name",
        accessor: "firmName"
      },
      {
        Header: "State",
        accessor: "state"
      },
      {
        Header: "Users",
        accessor: "numberOfUsers"
      },
      {
        Header: "Status",
        accessor: "statusDescription"
      },
      {
        Header: "Flag",
        accessor: row => (row.isTestFirm ? "Test Firm" : "Non-Test")
      }
    ], 
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
    <div>
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
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
    </div>
  )
}

export default App;
