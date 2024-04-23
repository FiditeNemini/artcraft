import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";

export const VoiceModelElement = ({
  model
}:{
  model: TtsModelListItem
})=>{
  return(
    <div
    className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center gap-3 cursor-pointer"
    onClick={()=>{}}
  >
    <span className="bg-brand-secondary-600 rounded-lg w-12 h-12"/>
    <div className="grow">
      <h4>{model.title}</h4>
    </div>
  </div>
  );
}