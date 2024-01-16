import { useState } from "react";
import { InputValidation, InputStateLibrary, ValidatorCallbacks } from "common/InputValidation";

interface Props {
  errorStrings: { [key:string]: { [error:string]: string } },
  state: { [key:string]: any },
  validators: { [key: string]: (value:any) => any }
}

interface ValidatorOutput { additional: any, value: any, reason: string, validation: any }

const noValidation = ({ inputValue }: ValidatorCallbacks) => ({ value: inputValue, reason: "", validation: InputValidation.Neutral });

export default function useChanger({ errorStrings, state: inputState, validators }: Props) {
  const baseValidation = Object.keys(inputState).reduce((obj,key) => ({ ...obj, [key]: {
    reason: "",
    validation: InputValidation.Neutral,
    value: inputState[key]
  } }),{})
  const [state,stateSet] = useState<InputStateLibrary>(baseValidation);
  
  const changer = (name: string) => ({ target }: { target: { value: any } }) => {
    // const setter = state[name][1];
    const validator = validators[name] ? validators[name] : noValidation;
    const { additional, value, reason, validation, } : ValidatorOutput = validator({ inputValue: target.value, name, state });
    const updateValidations = ( initial: InputStateLibrary ) => ({
      ...initial,
      ...additional,
      [name]: { reason, validation, value }
    });
    console.log(`📋 useChanger onChange, name: ${ name }`,{ reason, validation, value });
    stateSet(updateValidations);
    // setter(newValue);
  };

  const allAreValid = () => !Object.values(state).find((item,i) =>
    ((item.validation === InputValidation.Neutral) || (item.validation === InputValidation.Invalid)) );

  const setProps = (name: string) => ({
    name,
    value: state[name].value,
    invalidReason: errorStrings[name][state[name].reason] || "",
    onChange: changer(name)
  });

  const update = ({ name, reason, validation }: { name: string, reason: string, validation: number }) =>
    stateSet((lib: InputStateLibrary) => ({
      ...lib,
      [name]: { ...state[name], reason, validation }
    }));

 return { allAreValid, setProps, state, update };
};