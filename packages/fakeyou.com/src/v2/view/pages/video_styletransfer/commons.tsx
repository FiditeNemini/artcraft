import React from 'react';

export const inferenceFailures = (fail = "") => {
  switch (fail) {
    case "sample case": 
      return "Sample Case, this should not have been shown";
    default:
      return "Unknown failure";
  }
};

export function TableOfKeyValues(
{
  keyValues,
  height
}:{
  keyValues:{
    [key:string]:number|string|boolean|undefined
  };
  height?: number | string
}){
  return(<table style={{
    display:'block',
    height: height || "100%",
    overflowY: "scroll",
    overflowX: "clip",
    border: "1px solid white",
    borderTopLeftRadius: "1rem",
    borderBottomLeftRadius: "1rem",
  }}><tbody>
    <tr><th>Debug of a certain Key-Values set</th></tr>
    {
      Object.entries(keyValues).map(([key, val], index: number)=>{
        return <tr key={index}><td>{`${key}`}</td><td>{`${val}`}</td></tr>
      })
    }
  </tbody></table>);
}