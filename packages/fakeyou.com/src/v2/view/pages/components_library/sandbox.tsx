import React from 'react';
import VideoQuickTrim from 'components/common/VideoQuickTrim';
import { NavLink } from 'react-router-dom';


export default function ComponentSandbox(
  {parentPath}:{parentPath:string}
){
  const onChange = ()=>{
    console.log('onChange is triggered')
  }
  return (<>
    <NavLink to={`${parentPath}`}>← Back</NavLink>
    <h1>Sandbox</h1>

    <VideoQuickTrim 
      onChange={onChange}
      mediaToken='m_wdptbe5rfzpb1gzhva78gpw8qrkgs9'
    />
  </>);
}