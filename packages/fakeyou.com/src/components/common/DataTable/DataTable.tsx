import React from "react";
import "./DataTable.scss";

type Data = {
  property: string;
  value: string;
};

interface DataTableProps {
  data: Data[];
}

export default function DataTable({ data }: DataTableProps) {
  return (
    <table className="table no-outer-border">
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td className="data-table-property">{row.property}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
