import React  from 'react';
import { ProfileDataW2lTemplateListFc } from './ProfileData_W2lTemplateListFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { ProfileW2lInferenceResultsListFc } from '../profile/Profile_W2lInferenceResultListFc';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ProfileDataFc(props: Props) {
  let { username } = useParams();

  return (
    <div>
      <h1 className="title is-1"> My Data (Models, Results, etc.) </h1>

      <h3 className="title is-3"> Uploaded Templates </h3>

      <ProfileDataW2lTemplateListFc username={username} />

      <br />
      <br />

      {/* NB: This is outside of the directory hierachy. I should not build this twice! */}
      <h3 className="title is-3"> Lipsync Results </h3>
      <ProfileW2lInferenceResultsListFc username={username} />
      
    </div>
  )
}

export { ProfileDataFc };
