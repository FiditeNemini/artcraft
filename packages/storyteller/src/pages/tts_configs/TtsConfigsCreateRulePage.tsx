import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';

interface Props {
  sessionWrapper: SessionWrapper,
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function TtsConfigsCreateRulePage(props: Props) {
  return (
    <div>
      <h1> TTS : Create Rule </h1>
    </div>
  )
}

export { TtsConfigsCreateRulePage }