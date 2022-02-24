import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import { CHEER_BIT_LEVELS, CHEER_PREFIXES } from '../../../../twitch/Cheers';

// TODO: Don't duplicate
const CHEER_REGEX = /^([A-Za-z]+)(\d+)?$/;

interface BitsCheermotePrefixSpendThresholdProps {
  cheerPrefix: string,
  updateCheerNameOrPrefix: (cheerNameOrPrefix: string) => void,
  minimumBitsSpent: number,
  updateMinimumBitsSpent: (minimumSpent: number) => void,
};

function BitsCheermotePrefixSpendThresholdForm(props: BitsCheermotePrefixSpendThresholdProps) {
  const [cheerPrefix, setCheerPrefix] = useState<string>(props.cheerPrefix);
  const [customCheerPrefix, setCustomCheerPrefix] = useState<string>(props.cheerPrefix);

  const [bitsValue, setBitsValue] = useState<number>(props.minimumBitsSpent);
  const [customBitsValue, setCustomBitsValue] = useState<number>(props.minimumBitsSpent);

  // This handles initialization after mount.
  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    let newBitsValue = 1;

    // Cheer prefix could be just a prefix (eg. 'Corgo') OR the full name (eg. 'Corgo100')
    // This depends on what the previous view was.
    const matches = props.cheerPrefix.trim().match(CHEER_REGEX)

    if (!!matches && matches.length > 1) {
      // First match group
      setCheerPrefix(matches[1]);
      setCustomCheerPrefix(matches[1]);
      if (matches.length == 3 && matches[2] !== undefined) {
        // NB: Second match group can be 'undefined' if no number is present. (Zero-width matching?)
        let maybeValid = parseInt(matches[2]);
        if (!isNaN(maybeValid)) {
          newBitsValue = maybeValid;
        }
      }
    }

    if (!!props.minimumBitsSpent && !isNaN(props.minimumBitsSpent) && props.minimumBitsSpent > 0) {
      newBitsValue = props.minimumBitsSpent;
    }

    console.log('newBitsValue', newBitsValue);
    
    setBitsValue(newBitsValue);
    setCustomBitsValue(newBitsValue);

  }, [props.cheerPrefix, props.minimumBitsSpent]);

  console.log('bv', bitsValue);


  const updateCheerPrefix = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    setCheerPrefix(value);
    recalcuateFieldValue(value, bitsValue);
    return true;
  }

  const updateTextCheerValue = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setCustomCheerPrefix(value);
    props.updateCheerNameOrPrefix(value);
    return true;
  }

  // When the dropdowns are used, replace any manual text entry.
  const recalcuateFieldValue = (prefix: string, bits: number) => {
    if (prefix === undefined) {
      return;
    }
    const cheerValue = `${prefix}`;
    setCustomCheerPrefix(cheerValue);
    props.updateCheerNameOrPrefix(cheerValue);
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
              <select onChange={handleBitSelect}>
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
