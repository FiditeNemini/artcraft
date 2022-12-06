import React, { useEffect, useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';

interface TtsSingleVoiceFormProps {
  selectedTtsModelTokens: string[],
  updateSelectedTtsModelToken: (token: string) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function TtsSingleVoiceForm(props: TtsSingleVoiceFormProps) {
  const [ttsModelToken, setTtsModelToken] = useState('');

  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    if (props.selectedTtsModelTokens.length > 0) {
      setTtsModelToken(props.selectedTtsModelTokens[0]);
    }
  }, [props.selectedTtsModelTokens]);

  const handleModelSelect = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;

    if (!!value && !props.allTtsModelsByToken.has(value)) {
      return false;
    }

    setTtsModelToken(value);
    props.updateSelectedTtsModelToken(value);
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
          We apologize that this list is a nightmare to navigate right now. It will improve over time.
          In the mean time, <FakeYouExternalLink>check out the voices at FakeYou</FakeYouExternalLink> to 
          find the voices you want, experiment with them, and see which ones work best for your stream. The 
          names of the voices at FakeYou are the same as in this dropdown, so you can search at FakeYou, then 
          add them here when you're done looking.</div>
      </article>
    </>
  )
}

export { TtsSingleVoiceForm }
