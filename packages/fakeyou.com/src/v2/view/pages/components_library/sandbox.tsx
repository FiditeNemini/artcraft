import React, { useState } from 'react';
import VideoQuickTrim from 'components/common/VideoQuickTrim';
import { NavLink } from 'react-router-dom';

import {Container, Panel} from 'components/common';

export default function ComponentSandbox(
  {parentPath}:{parentPath:string}
){
  const [state1, setState1] = useState<number|string|boolean|undefined>(undefined);
  const [state2, setState2] = useState<number|string|boolean|undefined>(undefined);
  const handleCallback = (val:any)=>{
    console.log('onChange is triggered')
    console.log(val);
    setState1(val.trimStartSeconds);
    setState2(val.trimEndSeconds);
  }
  return (<Container>
    <NavLink to={`${parentPath}`}>← Back</NavLink>
    <h1>Sandbox</h1>
    <Panel>
      
      <div className="m-4">
        <VideoQuickTrim 
          trimStartSeconds={Number(state1 ||0)}
          trimEndSeconds={Number(state2 || 0)}
          onSelect={handleCallback}
          mediaToken='m_wdptbe5rfzpb1gzhva78gpw8qrkgs9'
        />
      </div>
      <br/>
      <p>{`Start Seconds: ${state1}`}</p>
      <p>{`Start Seconds: ${state2}`}</p>
      {/* <br/>
      <div className="m-4">
      <VideoQuickTrim 
        onSelect={handleCallback}
        mediaToken='m_h21nykes0j3ph23y5z7w9axtjjn2rr'
      />
      </div> */}
    </Panel>
  </Container>);
}