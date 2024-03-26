import { useState } from 'react';

import {
  Button,
  H4,
  ItemPicker,
  Textarea
} from "~/components"


export const TabStyling = ()=>{
  const [ selection, setSelection ] = useState<string>("Anime");
  const handlePickingStyle = (picked:string)=>{
    console.log(`Picked style: ${picked}`);
    setSelection(picked);
  }

  return(
    <>
      <H4>Select Base Style</H4>
      <div className="flex gap-2 my-2">
        <ItemPicker
          label="Anime"
          selected={(selection === "Anime")}
          onSelected={handlePickingStyle}
          src="/resources/avatars/0.webp"
        />
        <ItemPicker
          label="Pixel"
          selected={selection === "Pixel"}
          onSelected={handlePickingStyle}
          src="/resources/avatars/1.webp"
        />
        <ItemPicker
          label="Pixar"
          selected={selection === "Pixar"}
          onSelected={handlePickingStyle}
          src="/resources/avatars/2.webp"
        />
        <ItemPicker
          label="Stylized"
          selected={selection === "Stylized"}
          onSelected={handlePickingStyle}
          src="/resources/avatars/3.webp"
        />
      </div>
      <H4>Enter a Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea className="w-full h-32"/>
      </div>
      <H4>Negative Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea
          className="w-full h-32"
          placeholder="Type here to filter out the things you don't want in the scene
        "/>
      </div>
      <div className="flex gap-2 mt-6 justify-center">
        <Button>Preview Side by Side</Button>
      </div>
    </>
  );

}