import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
import { CHEER_BIT_LEVELS, CHEER_PREFIXES } from '../../../twitch/Cheers';

interface BitsSpendThresholdFormProps {
  minimumBitsSpent: number,
  updateMinimumBitsSpent: (minimumSpent: number) => void,
};

function BitsSpendThresholdForm(props: BitsSpendThresholdFormProps) {
  const [bitsValue, setBitsValue] = useState<number>(props.minimumBitsSpent);
  const [customAmount, setCustomAmount] = useState<number>(props.minimumBitsSpent);


  const handleBitSelect = (ev: React.FormEvent<HTMLSelectElement>) : boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);
    setBitsValue(numericValue);
    setCustomAmount(numericValue);
    props.updateMinimumBitsSpent(numericValue);
    return true;
  }

  const handleCustomAmountUpdate = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    const numericValue = parseInt(value);
    setCustomAmount(numericValue);
    props.updateMinimumBitsSpent(numericValue);
    return true;
  }

  return (
    <>
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
              value={customAmount}
              onChange={handleCustomAmountUpdate}
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

export { BitsSpendThresholdForm }
