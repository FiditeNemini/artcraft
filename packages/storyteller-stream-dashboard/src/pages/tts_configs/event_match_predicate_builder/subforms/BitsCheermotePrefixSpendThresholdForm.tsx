import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGem } from "@fortawesome/free-solid-svg-icons";
import {
  CHEER_BIT_LEVELS,
  CHEER_PREFIXES,
  CHEER_PREFIX_TO_STRING_MAP,
} from "../../../../twitch/Cheers";
import {
  CheerState,
  CheerStateIsCustom,
  CheerStateIsOfficial,
} from "../CheerState";

interface BitsCheermotePrefixSpendThresholdProps {
  cheerState: CheerState;

  updateCheerPrefix: (cheerNameOrPrefix: string) => void;
  updateMinimumBitsSpent: (minimumSpent: number) => void;
}

function BitsCheermotePrefixSpendThresholdForm(
  props: BitsCheermotePrefixSpendThresholdProps
) {
  const [cheerPrefix, setCheerPrefix] = useState<string>("");
  const [customCheerPrefix, setCustomCheerPrefix] = useState<string>("");

  const [bitsValue, setBitsValue] = useState<number>(1);
  const [customBitsValue, setCustomBitsValue] = useState<number>(1);

  // This handles initialization after mount.
  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    let newPrefix = "";
    let newCustomPrefix = "";
    let newBits = 1;
    let newCustomBits = 1;

    if (
      !!props.cheerState.bits &&
      !isNaN(props.cheerState.bits) &&
      props.cheerState.bits > 0
    ) {
      newBits = props.cheerState.bits;
      newCustomBits = props.cheerState.bits;
    }

    if (CheerStateIsOfficial(props.cheerState)) {
      if (!!props.cheerState.cheerPrefix) {
        newPrefix =
          CHEER_PREFIX_TO_STRING_MAP.get(props.cheerState.cheerPrefix) || "";
        newCustomPrefix =
          CHEER_PREFIX_TO_STRING_MAP.get(props.cheerState.cheerPrefix) || "";
      }
    } else if (CheerStateIsCustom(props.cheerState)) {
      newCustomPrefix = props.cheerState.cheerFull || "";
    }

    setCheerPrefix(newPrefix);
    setCustomCheerPrefix(newCustomPrefix);
    setBitsValue(newBits);
    setCustomBitsValue(newCustomBits);
  }, [props.cheerState]);

  const updateCheerPrefix = (
    ev: React.FormEvent<HTMLSelectElement>
  ): boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    setCheerPrefix(value);
    setCustomCheerPrefix(value);
    props.updateCheerPrefix(value);
    return true;
  };

  const updateTextCheerValue = (
    ev: React.FormEvent<HTMLInputElement>
  ): boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setCheerPrefix(value);
    setCustomCheerPrefix(value);
    props.updateCheerPrefix(value);
    return true;
  };

  const handleBitSelect = (ev: React.FormEvent<HTMLSelectElement>): boolean => {
    const value = (ev.target as HTMLSelectElement).value;
    const numericValue = parseInt(value);
    setBitsValue(numericValue);
    setCustomBitsValue(numericValue);
    props.updateMinimumBitsSpent(numericValue);
    return true;
  };
  const handleCustomBitsValueUpdate = (
    ev: React.FormEvent<HTMLInputElement>
  ): boolean => {
    const value = (ev.target as HTMLInputElement).value;
    const numericValue = parseInt(value);
    setCustomBitsValue(numericValue);
    props.updateMinimumBitsSpent(numericValue);
    return true;
  };

  return (
    <>
      <div className="alert alert-warning">
        This rule type requires <strong>both</strong> the cheermote to match and
        the bits spent to be equal or greater than the amount specified.
      </div>

      <div className="d-flex flex-column gap-4">
        <h2 className="mt-3">Cheermote matching</h2>
        <div className="form-group">
          <label className="sub-title">Pick the cheer prefix</label>
          <select
            onChange={updateCheerPrefix}
            value={cheerPrefix}
            className="form-select"
          >
            <option key={`option-*`} value="">
              Select cheer...
            </option>
            {CHEER_PREFIXES.map((cheerPrefix) => {
              return (
                <option key={`option-${cheerPrefix}`} value={cheerPrefix}>
                  {cheerPrefix}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label className="sub-title">
            To match against this (or set something custom)
          </label>
          <div className="input-icon">
            <span className="form-control-feedback">
              <FontAwesomeIcon icon={faGem} />
            </span>
            <input
              value={customCheerPrefix}
              onChange={updateTextCheerValue}
              className="form-control"
              type="text"
              placeholder="Cheermote full name (including bit value)"
            />
          </div>
        </div>
        <p>
          The "Cheer prefix" can be an actual cheer prefix, such as "SeemsGood",
          but it can also be an arbitrary string value. So if you make it
          "ManBearPig", that will be searched for in cheers. Cheermotes will be
          removed from the words used in TTS, but currently custom strings will
          not (though this may change in the future).
        </p>

        <h2 className="mt-3">Bits spent</h2>

        <div className="form-group">
          <label className="sub-title">Preset thresholds</label>
          <select
            onChange={handleBitSelect}
            value={bitsValue}
            className="form-select"
          >
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
          <div className="input-icon">
            <span className="form-control-feedback">
              <FontAwesomeIcon icon={faGem} />
            </span>
            <input
              value={customBitsValue}
              onChange={handleCustomBitsValueUpdate}
              className="form-control"
              type="text"
              placeholder="Cheermote full name (including bit value)"
            />
          </div>
        </div>
        <p>
          Remember that all Cheermotes in a single message add up, eg.{" "}
          <em>&ldquo;Cheer100 + Cheer100 + Party100&rdquo;</em> is 300 bits. A
          custom amount should give you flexibility to charge, say, 300 or 500
          bits. Or 420. Whatever you want.
        </p>
      </div>
    </>
  );
}

export { BitsCheermotePrefixSpendThresholdForm };
