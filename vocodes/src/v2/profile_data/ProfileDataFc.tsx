import React  from 'react';
import { ProfileData_W2lTemplateListFc } from './ProfileData_W2lTemplateListFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { Profile_W2lInferenceResultsListFc } from '../profile/Profile_W2lInferenceResultListFc';

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

      <br />
      <br />

      {/* NB: This is outside of the directory hierachy. I should not build this twice! */}
      <h3 className="title is-3"> Lipsync Results </h3>
      <Profile_W2lInferenceResultsListFc username={username} />
      
    </div>
  )
}

export { ProfileDataFc };
