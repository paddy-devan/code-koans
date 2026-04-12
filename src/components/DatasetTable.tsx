import type { VegaDatum } from "../koans/types";

type DatasetTableProps = {
  rows: VegaDatum[];
};

function getColumnNames(rows: VegaDatum[]) {
  const columns = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columns.add(key);
    }
  }

  return Array.from(columns);
}

export function DatasetTable({ rows }: DatasetTableProps) {
  if (rows.length === 0) {
    return <p className="dataset-empty">No rows are available for this dataset.</p>;
  }

  const columns = getColumnNames(rows);

  return (
    <div className="dataset-table-shell">
      <table className="dataset-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column}>{row[column] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
