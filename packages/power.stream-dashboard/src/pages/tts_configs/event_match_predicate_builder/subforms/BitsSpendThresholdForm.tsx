import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGem } from "@fortawesome/free-solid-svg-icons";
import { CHEER_BIT_LEVELS } from "../../../../twitch/Cheers";
import { CheerState } from "../CheerState";

interface BitsSpendThresholdFormProps {
  cheerState: CheerState;
  updateMinimumBitsSpent: (minimumSpent: number) => void;
}

function BitsSpendThresholdForm(props: BitsSpendThresholdFormProps) {
  // The dropdown
  const [bitsValue, setBitsValue] = useState<number>(1);
  // The freeform text input
  const [customAmount, setCustomAmount] = useState<number>(1);

  // NB: useState is not always setting from props correctly (after several re-renders) // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    if (
      !!props.cheerState.bits &&
      !isNaN(props.cheerState.bits) &&
      props.cheerState.bits > 0
    ) {
      setBitsValue(props.cheerState.bits);
      setCustomAmount(props.cheerState.bits);
    }
  }, [props.cheerState]);

  const handleBitSelect = (ev: React.FormEvent<HTMLSelectElement>): boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);

    if (!isNaN(numericValue) && numericValue > 0) {
      // Only update on valid positive integers
      setBitsValue(numericValue);
      setCustomAmount(numericValue);
      props.updateMinimumBitsSpent(numericValue);
    }

    return true;
  };

  const handleCustomAmountUpdate = (
    ev: React.FormEvent<HTMLInputElement>
  ): boolean => {
    const value = (ev.target as HTMLInputElement).value;
    const numericValue = parseInt(value);

    if (!isNaN(numericValue) && numericValue > 0) {
      // Only update on valid positive integers
      setBitsValue(numericValue);
      setCustomAmount(numericValue);
      props.updateMinimumBitsSpent(numericValue);
    }

    return true;
  };

  return (
    <>
      <div className="d-flex flex-column gap-4">
        <div className="form-group">
          <label className="sub-title">Preset thresholds</label>
          <select
            onChange={handleBitSelect}
            value={bitsValue}
            className="form-select"
          >
            <option key={`option-*`} value="">
              Choose or type...
            </option>
            {CHEER_BIT_LEVELS.map((level) => {
              return (
                <option key={`option-${level}`} value={level}>
                  Spend at least {level} bits
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label className="sub-title">Or a custom minimum amount.</label>
          <div className="form-group input-icon">
            <span className="form-control-feedback">
              <FontAwesomeIcon icon={faGem} />
            </span>
            <input
              value={customAmount}
              onChange={handleCustomAmountUpdate}
              className="form-control"
              type="text"
              placeholder="Cheermote full name (including bit value)"
            />
          </div>
          <p className="mt-3">
            Remember that all Cheermotes in a single message add up, eg.{" "}
            <em>&ldquo;Cheer100 + Cheer100 + Party100&rdquo;</em> is 300 bits. A
            custom amount should give you flexibility to charge, say, 300 or 500
            bits. Or 420. Whatever you want.
          </p>
        </div>
      </div>
    </>
  );
}

export { BitsSpendThresholdForm };
