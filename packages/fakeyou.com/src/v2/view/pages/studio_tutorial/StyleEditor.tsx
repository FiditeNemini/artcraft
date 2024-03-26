import React from 'react';

import { Button, TextArea } from "components/common";

import SelectionBubblesV2 from "components/common/SelectionBubblesV2";

import { VSTType } from "../storyteller_studio_intro/StudioVST/helpers";

interface Props {
  compositorStart: () => any,
  setVstValues: (input: any) => any,
  vstValues: VSTType,
}

export default function StyleEditor({ compositorStart, setVstValues, vstValues }: Props) {
  const styleOptions = [
    {
      label: "2D Anime",
      imageUrl: "/images/landing/onboarding/styles/style-2d-anime.webp",
      token: "anime_2d_flat",
    },
    {
      label: "3D Cartoon",
      imageUrl: "/images/landing/onboarding/styles/style-3d-cartoon.webp",
      token: "cartoon_3d",
    },
    {
      label: "Ink B&W",
      imageUrl: "/images/landing/onboarding/styles/style-ink-bw.webp",
      token: "ink_bw_style",
    },
    {
      label: "Origami",
      imageUrl: "/images/landing/onboarding/styles/style-origami.webp",
      token: "paper_origami",
    },
  ];

  const selectStyle = (selectedLabel: any) => {
    const selectedOption = styleOptions.find(
      option => option.label === selectedLabel
    );
    const selectedSdModelToken = selectedOption ? selectedOption.token : null;
    if (selectedSdModelToken) {
      setVstValues((curr: VSTType) => ({ ...curr, sdModelToken: selectedSdModelToken }));
    }
  };

  const handleOnChange = (val: {
    [key: string]: number | string | boolean | undefined;
  }) => {
    setVstValues((curr: VSTType) => ({ ...curr, ...val }));
  };


  return <div {...{ className: "tutorial-style-tab" }}>
    <SelectionBubblesV2 {...{
      options: Object.values(styleOptions),
      onSelect: selectStyle,
      mobileSideScroll: true,
      selectedStyle: "outline",
      variant: "card"
    }}/>
    <TextArea
      label="Enter a prompt"
      placeholder="Enter your description..."
      onChange={e => handleOnChange({ posPrompt: e.target.value })}
      value={vstValues.posPrompt}
      required={false}
      rows={5}
      resize={false}
    />
    <TextArea
      label="Negative prompt"
      placeholder="Enter your description..."
      onChange={e => handleOnChange({ negPrompt: e.target.value })}
      value={vstValues.negPrompt}
      required={false}
      rows={5}
      resize={false}
    />
    <Button {...{
      label: "Generate Your Movie",
      onClick: compositorStart,
    }} />
  </div>;
};