import React, { useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';

interface TtsSingleVoiceFormProps {
  // Storyteller TTS configs
  ttsModelToken: string,
  setTtsModelToken: (token: string) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function TtsSingleVoiceForm(props: TtsSingleVoiceFormProps) {
  const [ttsModelToken, setTtsModelToken] = useState(props.ttsModelToken);

  const handleModelSelect = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;

    if (!!value && !props.allTtsModelsByToken.has(value)) {
      return false;
    }

    setTtsModelToken(value);
    props.setTtsModelToken(value);
    return true;
  }

  return (
    <>
      <div className="field">
        <label className="label">TTS Voice Model</label>
        <div className="control">
          <div className="select is-medium is-fullwidth">
            <select
              value={ttsModelToken}
              onChange={handleModelSelect}
              >
              <option value="">Select a voice...</option>
              {props.allTtsModels.map(ttsModel => {
                return (
                  <option
                    key={`option-${ttsModel.model_token}`}
                    value={ttsModel.model_token}
                  >{ttsModel.title}</option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <article className="message">
        <div className="message-body">
          <FakeYouExternalLink>Check out the voices at FakeYou</FakeYouExternalLink> to search for voices, experiment with them,
          and see how they sound. Sorry that this list is a nightmare to navigate. It will improve over time.
        </div>
      </article>
    </>
  )
}

export { TtsSingleVoiceForm }
