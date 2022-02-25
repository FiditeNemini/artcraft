import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import { CHEER_BIT_LEVELS, CHEER_PREFIXES, CHEER_PREFIX_TO_STRING_MAP } from '../../../../twitch/Cheers';
import { CheerState, CheerStateIsCustom, CheerStateIsOfficial } from '../CheerState';

interface BitsCheermotePrefixSpendThresholdProps {
  cheerState: CheerState,

  updateCheerPrefix: (cheerNameOrPrefix: string) => void,
  updateMinimumBitsSpent: (minimumSpent: number) => void,
};

function BitsCheermotePrefixSpendThresholdForm(props: BitsCheermotePrefixSpendThresholdProps) {
  const [cheerPrefix, setCheerPrefix] = useState<string>('');
  const [customCheerPrefix, setCustomCheerPrefix] = useState<string>('');

  const [bitsValue, setBitsValue] = useState<number>(1);
  const [customBitsValue, setCustomBitsValue] = useState<number>(1);

  // This handles initialization after mount.
  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    let newPrefix = '';
    let newCustomPrefix = '';
    let newBits = 1;
    let newCustomBits = 1;

    if (CheerStateIsOfficial(props.cheerState)) {
      if (!!props.cheerState.cheerPrefix) {
        newPrefix = CHEER_PREFIX_TO_STRING_MAP.get((props.cheerState.cheerPrefix)) || '';
        newCustomPrefix = CHEER_PREFIX_TO_STRING_MAP.get((props.cheerState.cheerPrefix)) || '';
      }
      
      if (!!props.cheerState.bits && !isNaN(props.cheerState.bits) && props.cheerState.bits > 0) {
        newBits = props.cheerState.bits;
        newCustomBits = props.cheerState.bits;
      }

    } else if (CheerStateIsCustom(props.cheerState)) {
      newCustomPrefix = props.cheerState.cheerFull || '';

      if (!!props.cheerState.bits && !isNaN(props.cheerState.bits) && props.cheerState.bits > 0) {
        newBits = props.cheerState.bits;
        newCustomBits = props.cheerState.bits;
      }
    }

    setCheerPrefix(newPrefix);
    setCustomCheerPrefix(newCustomPrefix);
    setBitsValue(newBits);
    setCustomBitsValue(newCustomBits);

  }, [props.cheerState]);

  const updateCheerPrefix = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    setCheerPrefix(value);
    setCustomCheerPrefix(value);
    props.updateCheerPrefix(value);
    return true;
  }

  const updateTextCheerValue = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setCheerPrefix(value);
    setCustomCheerPrefix(value);
    props.updateCheerPrefix(value);
    return true;
  }

  const handleBitSelect = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);
    setBitsValue(numericValue);
    setCustomBitsValue(numericValue);
    props.updateMinimumBitsSpent(numericValue);
    return true;
  }
  const handleCustomBitsValueUpdate = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    const numericValue = parseInt(value);
    setCustomBitsValue(numericValue);
    props.updateMinimumBitsSpent(numericValue);
    return true;
  }

  return (
    <>
      <article className="message is-warning">
        <div className="message-body">
          This rule type requires <strong>both</strong> the cheermote 
          to match and the bits spent to be equal or greater than the amount specified.
        </div>
      </article>

      <h1 className="title is-5">Cheermote matching</h1>
      
      <div className="field is-grouped">
        <div className="control">
          <label className="label">Pick the cheer prefix</label>
          <div className="select is-medium">
            <select 
              onChange={updateCheerPrefix}
              value={cheerPrefix}
              >
              <option
                key={`option-*`}
                value=""
              >Select cheer...</option>
              {CHEER_PREFIXES.map(cheerPrefix => {
                return (
                  <option
                    key={`option-${cheerPrefix}`}
                    value={cheerPrefix}
                  >{cheerPrefix}</option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="control is-expanded">
          <label className="label">To match against this (or set something custom)</label>
          <p className="control has-icons-left is-large">
            <input 
              value={customCheerPrefix}
              onChange={updateTextCheerValue}
              className="input is-medium is-primary" 
              type="text" 
              placeholder="Cheermote full name (including bit value)" />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faGem} />
            </span>
          </p>
        </div>
      </div>

      <article className="message">
        <div className="message-body">
          The "Cheer prefix" can be an actual cheer prefix, such as "SeemsGood", but it can also be an arbitrary
          string value. So if you make it "ManBearPig", that will be searched for in cheers. 

          Cheermotes will be removed from the words used in TTS, but currently custom strings will not (though 
          this may change in the future).
        </div>
      </article>

      <h1 className="title is-5">Bits spent</h1>

      <div className="field is-grouped">
        <div className="control">
          <label className="label">Preset thresholds</label>
          <div className="control">
            <div className="select is-medium">
              <select 
                onChange={handleBitSelect}
                value={bitsValue}
                >
                {CHEER_BIT_LEVELS.map(level => {
                  return (
                    <option
                      key={`option-${level}`}
                      value={level}
                    >Spend at least {level} bits</option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="control is-expanded">
          <label className="label">Or a custom minimum amount.</label>
          <p className="control has-icons-left is-large">
            <input 
              value={customBitsValue}
              onChange={handleCustomBitsValueUpdate}
              className="input is-medium is-primary" 
              type="text" 
              placeholder="Cheermote full name (including bit value)" />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faGem} />
            </span>
          </p>
        </div>
      </div>
      <article className="message">
        <div className="message-body">
          Remember that all Cheermotes in a single message add up, 
          eg. <em>&ldquo;Cheer100 + Cheer100 + Party100&rdquo;</em> is 300 bits. 
          A custom amount should give you flexibility to charge, say, 300 or 500 bits. 
          Or 420. Whatever you want.
        </div>
      </article>

    </>
  )
}

export { BitsCheermotePrefixSpendThresholdForm }
