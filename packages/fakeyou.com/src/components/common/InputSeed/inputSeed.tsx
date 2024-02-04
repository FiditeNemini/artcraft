import React, {useState, useEffect, memo} from 'react';
import {
  Input,
  SegmentButtons
} from "components/common";

import generateRandomSeed from 'resources/generateRandomSeed';

export default memo (function InputSeed({
  label,
  initialValue : initialValueProps,
  onChange : onChangeCallback
}:{
  label:string;
  initialValue?: string;
  onChange: (newSeed: string)=>void;
}){
  const [inputType, setInputType] = useState<"random"|"custom">("random");
  const [seedValue, setSeedValue] = useState<string>(initialValueProps || "");
  useEffect(()=>{
    // console.log('should run only once when mount')
    if (!initialValueProps && seedValue===""){
      const newRandom = generateRandomSeed();
      setSeedValue(newRandom);
      onChangeCallback(newRandom);
    }
  },[initialValueProps, onChangeCallback, seedValue]);

  const handleInputTypeChange = (e:any) => {
    const newValue = e.target.value;
    if (newValue === "custom") {
      setInputType("custom");
    } else {
      const newRandom = generateRandomSeed();
      setInputType("random");
      setSeedValue(newRandom);
      onChangeCallback(newRandom);
    }
  };
  const handleSeedChange = (e: any) => {
    const customSeed = e.target.value;
    setInputType("custom");
    setSeedValue(customSeed);
    onChangeCallback(customSeed);
  };

  const seedOpts = [
    { label: "Random", value: "random" },
    { label: "Custom", value: "custom" },
  ];

  return(
    <div>
      <label className="sub-title">{label}</label>
      <div className="d-flex gap-2 align-items-center">
        <SegmentButtons
          {...{
            name: "seed",
            onChange: handleInputTypeChange,
            options: seedOpts,
            value: inputType,
          }}
        />
        <Input
          className="numberInputNoArrows"
          placeholder="Random"
          value={seedValue}
          onChange={handleSeedChange}
          type="number"
        />
      </div>
    </div>
  )
});