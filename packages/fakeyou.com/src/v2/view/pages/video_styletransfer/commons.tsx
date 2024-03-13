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
  title,
  keyValues,
  height
}:{
  title: string;
  keyValues:{
    [key:string]:number|string|boolean|undefined
      |{ [key:string]:number|string}
  };
  height?: number | string
}){
  return(<table style={{
    display:'block',
    height: height || "100%",
    overflowY: "scroll",
    overflowX: "clip",
    // border: "1px solid white",
    // borderTopLeftRadius: "1rem",
    // borderBottomLeftRadius: "1rem",
  }}><tbody>
    <tr><th>{title}</th></tr>
    {
      Object.entries(keyValues).map(([key, val], index: number)=>{
        if(key!=="defaultCN" && key!=="defaultPrompts")
          return <tr key={index}><td>{`${key}`}</td><td>{`${val}`}</td></tr>
        else return null
      })
    }
  </tbody></table>);
}