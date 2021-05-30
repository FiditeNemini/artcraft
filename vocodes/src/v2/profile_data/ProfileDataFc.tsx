import React  from 'react';
import { ProfileData_W2lTemplateListFc } from './ProfileData_W2lTemplateListFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useParams } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ProfileDataFc(props: Props) {
  let { username } = useParams();

  return (
    <div>
      <h1 className="title is-1"> My Data (Models, Results, etc.) </h1>

      <h3 className="title is-3"> Uploaded Templates </h3>

      <ProfileData_W2lTemplateListFc username={username} />
      
    </div>
  )
}

export { ProfileDataFc };
