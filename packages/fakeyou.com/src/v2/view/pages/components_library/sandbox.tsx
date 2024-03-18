import React, { 
  useState
} from 'react';
import { VideoPlayer } from 'components/common/VideoPlayer';
import { VideoPlayerQuickTrim } from 'components/common/VideoPlayerQuickTrim';

import { NavLink } from 'react-router-dom';

import {Container, Panel} from 'components/common';

export default function ComponentSandbox(
  {parentPath}:{parentPath:string}
){
  const [state1, setState1] = useState<number|string|boolean|undefined>(undefined);
  const [state2, setState2] = useState<number|string|boolean|undefined>(undefined);
  const handleCallback = (val:any)=>{
    // console.log('onChange is triggered')
    // console.log(val);
    setState1(val.trimStartMs);
    setState2(val.trimEndMs);
  }
  return (<Container>
    <NavLink to={`${parentPath}`}>← Back</NavLink>
    <h1>Sandbox</h1>
    <Panel>
      
      <div className="m-4">
        <VideoPlayer
          mediaToken='m_wdptbe5rfzpb1gzhva78gpw8qrkgs9'
        />
      </div>
      <br/>
      <VideoPlayerQuickTrim
        trimStartMs={Number(state1 ||0)}
        trimEndMs={Number(state2 || 0)}
        onSelectTrim={handleCallback}
        mediaToken='m_wdptbe5rfzpb1gzhva78gpw8qrkgs9'
      />
      <p>{`Start Seconds: ${state1}`}</p>
      <p>{`Start Seconds: ${state2}`}</p>
    </Panel>
  </Container>);
}