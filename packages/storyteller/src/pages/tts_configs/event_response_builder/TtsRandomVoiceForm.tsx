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

  const handleAddVoice = (ev: React.FormEvent<HTMLButtonElement>) : boolean => {
    ev.preventDefault();

    let newModelTokens = [...props.selectedTtsModelTokens];

    newModelTokens.push('');

    props.updateSelectedTtsModelTokens(newModelTokens);

    return true;
  }

  const handleModelSelect = (ttsModelToken: string, voiceIndex: number) => {
    let newModelTokens = [...props.selectedTtsModelTokens];

    if (voiceIndex >= ttsModelToken.length) {
      return;
    }

    newModelTokens[voiceIndex] = ttsModelToken;
    props.updateSelectedTtsModelTokens(newModelTokens);
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
        handleModelSelect={handleModelSelect}
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
        handleModelSelect={handleModelSelect}
        allTtsModels={props.allTtsModels}
        allTtsModelsByToken={props.allTtsModelsByToken}
        />
    )
  }

  return (
    <>

      {selectBoxes}

      <button 
        className="button is-large is-fullwidth is-info"
        onClick={handleAddVoice}
        >
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
  // Actual token or empty string
  selectedTtsModelToken: string,

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
    const maybeModelToken = (ev.target as HTMLSelectElement).value;

    if (!maybeModelToken) {
      // Clear selection
      props.handleModelSelect(maybeModelToken, props.voiceIndex);
      return true;
    }

    if (!!maybeModelToken && !props.allTtsModelsByToken.has(maybeModelToken)) {
      return false;
    }

    props.handleModelSelect(maybeModelToken, props.voiceIndex);
    return true;
  }

  return (
    <div key={`dropdown-${props.voiceIndex}`}>
      <div className="field">
        <label className="label">TTS Voice Model (used as a Random Voice)</label>
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
