import React from "react";
import "./Spinner.scss";

const Line = ({ yah }:{ yah: any }) => <polyline {...{
    fill: 'none',
    points: `16 8 16 2`,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '3',
    transform: `rotate(${ 30 * yah })`,
  }}/>;

export default function Spinner() {
  return <svg {...{ className: "fy-spinner", height: 32, viewBox: "0 0 32 32", width: 32 }}>
    { [...Array(12)].map((l,key) => <Line {...{ key, yah: key }}/>) }
</svg>;
};