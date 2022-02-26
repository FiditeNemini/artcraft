import React, { useEffect, useState } from 'react';
import { TtsModelListItem } from '@storyteller/components/src/api/tts/ListTtsModels';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface TtsRandomVoiceFormProps {
  selectedTtsModelTokens: string[],
  updateSelectedTtsModelTokens: (tokens: string[]) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
};

function TtsRandomVoiceForm(props: TtsRandomVoiceFormProps) {
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
    props.updateSelectedTtsModelTokens([value]); // TODO
    return true;
  }


  const handleModelSelect2 = (ttsModelToken: string, voiceIndex: number) => {
    // TODO; also rename
  }

  console.log('selected', props.selectedTtsModelTokens);

  let selectBoxes : JSX.Element[] = [];

  // No tokens - show one box (unselected)
  // One or more tokens - show boxes for each (with selections)

  props.selectedTtsModelTokens.forEach((token, index) => {
    selectBoxes.push(
      <VoiceDropdown
        key={index}
        selectedTtsModelToken={token}
        voiceIndex={index}
        handleModelSelect={handleModelSelect2}
        allTtsModels={props.allTtsModels}
        allTtsModelsByToken={props.allTtsModelsByToken}
        />
    )
  });

  if (selectBoxes.length === 0) {
    selectBoxes.push(
      <VoiceDropdown
        key={0}
        selectedTtsModelToken={""}
        voiceIndex={0}
        handleModelSelect={handleModelSelect2}
        allTtsModels={props.allTtsModels}
        allTtsModelsByToken={props.allTtsModelsByToken}
        />
    )
  }

  return (
    <>

      {selectBoxes}

      <button className="button is-large is-fullwidth is-info">
        <FontAwesomeIcon icon={faPlus} />&nbsp;Add Additional Voice
      </button>

      <br />

      <article className="message">
        <div className="message-body">
          <FakeYouExternalLink>Check out the voices at FakeYou</FakeYouExternalLink> to search for voices, experiment with them,
          and see how they sound. Sorry that this list is a nightmare to navigate. It will improve over time.
        </div>
      </article>
    </>
  )
}

interface VoiceDropdownProps {
  // Actual token, empty string, or undefined
  selectedTtsModelToken?: string,

  // Position in the list, 0-indexed
  voiceIndex: number,

  // Callbacks
  handleModelSelect: (token: string, index: number) => void,

  // FakeYou voices
  allTtsModels: TtsModelListItem[],
  allTtsModelsByToken: Map<string, TtsModelListItem>,
}

function VoiceDropdown(props: VoiceDropdownProps) {

  const handleSelectChange = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    props.handleModelSelect(value, props.voiceIndex);
    return true;
  }

  return (
    <div key={`dropdown-${props.voiceIndex}`}>
      <div className="field">
        <label className="label">TTS Voice Model</label>
        <div className="control">
          <div className="select is-medium is-fullwidth">
            <select
              value={props.selectedTtsModelToken}
              onChange={handleSelectChange}
              >
              <option 
                key={`option-${props.voiceIndex}-*`}
                value="">
                Select a voice...</option>
              {props.allTtsModels.map(ttsModel => {
                return (
                  <option
                    key={`option-${props.voiceIndex}-${ttsModel.model_token}`}
                    value={ttsModel.model_token}
                  >{ttsModel.title}</option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <br />
    </div>
  );
}

export { TtsRandomVoiceForm }
