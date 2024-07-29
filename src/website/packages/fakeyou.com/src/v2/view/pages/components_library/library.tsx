import React from 'react';
import { NavLink } from 'react-router-dom';

export default function LibraryOfCommonComponents(
  {parentPath}:{parentPath:string}
){
  return (<>
    <NavLink to={`${parentPath}`}>← Back</NavLink>
    <h1>List of all Common Components</h1>
  </>);
}