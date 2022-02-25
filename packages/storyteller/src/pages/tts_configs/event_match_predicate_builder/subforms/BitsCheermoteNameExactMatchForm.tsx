import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import { CHEER_BIT_LEVELS, CHEER_PREFIXES, CHEER_PREFIX_TO_STRING_MAP } from '../../../../twitch/Cheers';
import { CheerState, CheerStateIsCustom, CheerStateIsOfficial } from '../CheerState';

// TODO: Don't duplicate
const CHEER_REGEX = /^([A-Za-z]+)(\d+)?$/;

interface BitsCheermoteNameExactMatchProps {
  cheerState: CheerState,

  updateCheerName: (cheerNameOrPrefix: string) => void,
  updateCheerPrefix: (cheerNameOrPrefix: string) => void,
  
  // NB: 'minimumBitsSpent' and its update are technically not a field here, but we can parse it out
  // to communicate back upstream in case the field changes, or infer it from a context switch to this
  // field. Basically, we're trying not to lose information.
  updateMinimumBitsSpent: (minimumSpent: number) => void, 
};

function BitsCheermoteNameExactMatchForm(props: BitsCheermoteNameExactMatchProps) {
  // The two dropdowns
  const [cheerPrefix, setCheerPrefix] = useState<string>('');
  const [bitsValue, setBitsValue] = useState<number>(1);
  // The freeform text input
  const [manualCheerValue, setManualCheerValue] = useState<string>('');

  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    let newPrefix = '';
    let newBits = 1;
    let newFullName = '';

    if (CheerStateIsOfficial(props.cheerState)) {
      if (!!props.cheerState.cheerPrefix) {
        newPrefix = CHEER_PREFIX_TO_STRING_MAP.get((props.cheerState.cheerPrefix)) || '';
      }
      
      if (!!props.cheerState.bits && !isNaN(props.cheerState.bits) && props.cheerState.bits > 0) {
        newBits = props.cheerState.bits;
        newFullName = `${newPrefix}${newBits}`;
      } else {
        newFullName = newPrefix;
      }

    } else if (CheerStateIsCustom(props.cheerState)) {
      newFullName = props.cheerState.cheerFull || '';

      if (!!props.cheerState.bits && !isNaN(props.cheerState.bits) && props.cheerState.bits > 0) {
        newBits = props.cheerState.bits;
      }
    }

    setCheerPrefix(newPrefix);
    setBitsValue(newBits);
    setManualCheerValue(newFullName);

  }, [props.cheerState]);

  const updateCheerPrefix = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    setCheerPrefix(value);
    recalcuateFieldValue(value, bitsValue);
    return true;
  }

  const updateBitsValue = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);
    if (!isNaN(numericValue)) {
      // NB: The form shouldn't yield NaN, but just in case.
      setBitsValue(numericValue);
      recalcuateFieldValue(cheerPrefix, numericValue);
    }
    return true;
  }

  const updateTextCheerValue = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;

    // Cheer name is the full value, eg. 'Corgo100'
    const matches = value.trim().match(CHEER_REGEX)

    if (!!matches && matches.length > 1) {
      setCheerPrefix(matches[1]); // First match group
      if (matches.length == 3 && matches[2] !== undefined) {
        // NB: Second match group can be 'undefined' if no number is present. (Zero-width matching?)
        const maybeBits = parseInt(matches[2]);
        if (!isNaN(maybeBits)) {
          setBitsValue(maybeBits); // Second match group
          props.updateMinimumBitsSpent(maybeBits); // NB: Technically not in this form, but helps when switching
        }
      }
    }

    setManualCheerValue(value);
    props.updateCheerName(value);
    return true;
  }

  // When the dropdowns are used, replace any manual text entry.
  const recalcuateFieldValue = (prefix: string, bits: number) => {
    const cheerValue = `${prefix}${bits}`;
    setManualCheerValue(cheerValue);
    props.updateCheerName(cheerValue);
    props.updateMinimumBitsSpent(bits); // NB: Technically not in this form, but helps when switching
  }

  return (
    <>
      <div className="field is-grouped">
        <div className="control">
          <label className="label">Pick the cheer</label>
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
        <div className="control">
          <label className="label">Then the bit value</label>
          <div className="control">
            <div className="select is-medium">
              <select 
                onChange={updateBitsValue}
                value={bitsValue}
                >
                {CHEER_BIT_LEVELS.map(level => {
                  return (
                    <option
                      key={`option-${cheerPrefix}-${level}`}
                      value={level}
                    >{level}</option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="control is-expanded">
          <label className="label">To match against this (or set something custom)</label>
          <p className="control has-icons-left is-large">
            <input 
              value={manualCheerValue}
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
    </>
  )
}

export { BitsCheermoteNameExactMatchForm }
