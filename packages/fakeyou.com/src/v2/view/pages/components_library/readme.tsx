import React from "react";
import { NavLink } from "react-router-dom";

export default function ReadMePage(
  {parentPath}:{parentPath:string}
){
  return(
    <>
      <h1>Component Library</h1>
      <p>Please read the following before development</p>
      <NavLink
        to={`${parentPath}/sandbox`}
      >
        Sandbox
      </NavLink>
      <br />
      <NavLink
        to={`${parentPath}/common`}
      >
        Common Compomnents
      </NavLink>
    </>
  );
}