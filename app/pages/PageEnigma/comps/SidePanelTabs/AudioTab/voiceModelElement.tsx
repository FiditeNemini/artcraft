import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { H4, H6 } from "~/components";
import { VoiceConversionModelListItem } from "./typesImported";
export const VoiceModelElement = ({
  model,
  onSelect,
}: {
  model: TtsModelListItem | VoiceConversionModelListItem;
  onSelect: (item: TtsModelListItem | VoiceConversionModelListItem) => void;
}) => {
  let creatorName: string | undefined;
  if ("creator_display_name" in model) {
    //case of TTS Models
    creatorName = model.creator_display_name;
  } else if ("creator" in model) {
    //case of V2V Models
    creatorName = model.creator.display_name;
  } else {
    creatorName = undefined;
  }
  return (
    <button
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-transparent bg-brand-secondary p-3 text-start transition-all hover:border-ui-controls-button hover:bg-ui-controls-button/40"
      onClick={() => onSelect(model)}>
      <span className="h-12 w-12 rounded-lg bg-ui-controls-button/100" />
      <div className="grow">
        <H4>{model.title}</H4>
        {creatorName && <H6 className="text-white/70">{creatorName}</H6>}
      </div>
    </button>
  );
};
