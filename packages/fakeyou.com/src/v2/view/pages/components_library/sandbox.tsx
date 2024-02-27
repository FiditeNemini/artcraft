import React from 'react';
import VideoQuickTrim from 'components/common/VideoQuickTrim';
import { NavLink } from 'react-router-dom';

import {Container, Panel} from 'components/common';

export default function ComponentSandbox(
  {parentPath}:{parentPath:string}
){
  const onChange = ()=>{
    console.log('onChange is triggered')
  }
  return (<Container>
    <NavLink to={`${parentPath}`}>← Back</NavLink>
    <h1>Sandbox</h1>
    <Panel>
      
      <div className="m-4">
        <VideoQuickTrim 
          onChange={onChange}
          mediaToken='m_wdptbe5rfzpb1gzhva78gpw8qrkgs9'
        />
      </div>
      <br/>
      <br/>
      <div className="m-4">
      <VideoQuickTrim 
        onChange={onChange}
        mediaToken='m_h21nykes0j3ph23y5z7w9axtjjn2rr'
      />
      </div>
    </Panel>
  </Container>);
}