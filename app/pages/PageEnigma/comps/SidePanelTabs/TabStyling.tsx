
import {
  H4,
  ItemPicker,
  Textarea
} from "~/components"


export const TabStyling = ()=>{
  const handlePickingStyle = (picked:string)=>{
    console.log(`Picked style: ${picked}`);
  }

  return(
    <>
      <H4>Select Base Style</H4>
      <div className="flex gap-2 my-2">
        <ItemPicker
          label="Anime"
          onClick={()=>handlePickingStyle("anime")}
          src="/resources/avatars/0.webp"
        />
        <ItemPicker
          label="Pixel"
          onClick={()=>handlePickingStyle("pixel")}
          src="/resources/avatars/1.webp"
        />
        <ItemPicker
          label="Pixar"
          onClick={()=>handlePickingStyle("pixar")}
          src="/resources/avatars/2.webp"
        />
        <ItemPicker
          label="Stylized"
          onClick={()=>handlePickingStyle("stylized")}
          src="/resources/avatars/3.webp"
        />
      </div>
      <H4>Enter a Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea className="w-full" />
      </div>
      <H4>Negative Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea
          className="w-full"
          placeholder="Type here to filter out the things you don't want in the scene
        "/>
      </div>
    </>
  );

}