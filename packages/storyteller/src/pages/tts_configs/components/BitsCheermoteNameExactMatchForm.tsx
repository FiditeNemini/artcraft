import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import { CHEER_BIT_LEVELS, CHEER_PREFIXES } from '../../../twitch/Cheers';

interface BitsCheermoteNameExactMatchProps {
};

function BitsCheermoteNameExactMatchForm(props: BitsCheermoteNameExactMatchProps) {
  const [cheerPrefix, setCheerPrefix] = useState<string|undefined>();
  const [bitsValue, setBitsValue] = useState<number>(1);
  const [manualCheerValue, setManualCheerValue] = useState<string>("");

  const updateCheerPrefix = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    setCheerPrefix(value);
    recalcuateFieldValue(value, bitsValue);
    return true;
  }

  const updateBitsValue = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);
    setBitsValue(numericValue);
    recalcuateFieldValue(cheerPrefix, numericValue);
    return true;
  }

  const updateTextCheerValue = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setManualCheerValue(value);
    return true;
  }

  // When the dropdowns are used, replace any manual text entry.
  const recalcuateFieldValue = (prefix: string|undefined, bits: number) => {
    if (prefix === undefined) {
      return;
    }
    const cheerValue = `${prefix}${bits}`;
    setManualCheerValue(cheerValue);
  }

  return (
    <>
      <div className="field is-grouped">
        <div className="control">
          <label className="label">Pick the cheer</label>
          <div className="select is-medium">
            <select onChange={updateCheerPrefix}>
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
              <select onChange={updateBitsValue}>
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
