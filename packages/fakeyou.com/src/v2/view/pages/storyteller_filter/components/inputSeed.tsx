import React, {useState} from 'react';
import {
  Input,
  SegmentButtons
} from "components/common";

export default function InputSeet({
  label,
  onChange : onChangeCallback
}:{
  label:string
  onChange: (newSeed: string)=>void
}){
  function generateRandomSeed(){ 
    return Math.floor(Math.random() * Math.pow(2, 32)).toString();
  };

  const [inputType, setInputType] = useState<"random"|"custom">("random");
  const [seedValue, setSeedValue] = useState<string>(generateRandomSeed());

  const handleInputTypeChange = (e:any) => {
    console.log(typeof e);
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
  const handleSeedChange = (event: any) => {
    const customSeed = event.target.value;
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
}