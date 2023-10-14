import React from "react";
import "./DataTable.scss";
import { Link } from "react-router-dom";

type Data = {
  property: string;
  value: string;
  link?: string;
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
            {row.link ? (
              <td>
                <Link to={row.link}>{row.value}</Link>
              </td>
            ) : (
              <td>{row.value}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
