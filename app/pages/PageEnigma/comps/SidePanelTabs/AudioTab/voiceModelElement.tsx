import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { H4, H6 } from "~/components";
export const VoiceModelElement = ({
  model,
  onSelect
}:{
  model: TtsModelListItem
  onSelect:(item:TtsModelListItem)=>void
})=>{
  return(
    <div
      className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center gap-3 cursor-pointer border-2 border-brand-secondary hover:border-brand-secondary-700"
      onClick={()=>onSelect(model)}
    >
    <span className="bg-brand-secondary-600 rounded-lg w-12 h-12"/>
    <div className="grow">
      <H4>{model.title}</H4>
      <H6>by {model.creator_display_name}</H6>
    </div>
  </div>
  );
}