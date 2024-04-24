import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { H4, H6 } from "~/components";
import { VoiceConversionModelListItem } from "./typesImported";
export const VoiceModelElement = ({
  model,
  onSelect
}:{
  model: TtsModelListItem | VoiceConversionModelListItem;
  onSelect:(item:TtsModelListItem | VoiceConversionModelListItem)=>void
})=>{
  let creatorName: string|undefined;
  if ("creator_display_name" in model){
    //case of TTS Models
    creatorName = model.creator_display_name;
  }else if("creator" in model){
    //case of V2V Models
    creatorName = model.creator.display_name
  }else {
    creatorName = undefined;
  }
  return(
    <div
      className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center gap-3 cursor-pointer border-2 border-brand-secondary hover:border-brand-secondary-700"
      onClick={()=>onSelect(model)}
    >
    <span className="bg-brand-secondary-600 rounded-lg w-12 h-12"/>
    <div className="grow">
      <H4>{model.title}</H4>
      {creatorName && <H6>{creatorName}</H6>}
    </div>
  </div>
  );
}