import { useCallback, useState } from "react";
import { Input } from "~/components";
import { AudioTabPages } from "./types";
import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { VoiceModelElement } from "./voiceModelElement";

export const PageSelectTtsModel = ({
  changePage,
  ttsModels,
  onSelect,
}: {
  changePage: (newPage: AudioTabPages) => void;
  ttsModels: Array<TtsModelListItem>;
  onSelect: (item: TtsModelListItem) => void;
}) => {
  const [query, setQuery] = useState("");
  const filteredListOfModels =
    query === ""
      ? ttsModels
      : ttsModels.filter((model) => {
          return model.title
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""));
        });

  const slicedArray = filteredListOfModels.slice(0, 20);

  const refCallback = useCallback((node: HTMLInputElement) => {
    if (node) node.focus();
    //auto focus on the mounting on the input component
  }, []);

  return (
    <>
      <TabTitle
        title="Search TTS Voices"
        onBack={() => changePage(AudioTabPages.GENERATE_AUDIO)}
      />
      <div className="flex flex-col gap-4 overflow-hidden">
        <Input
          ref={refCallback}
          className="mt-1 px-4"
          placeholder="Search Voice by Name"
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex w-full grow flex-col gap-3 overflow-y-auto px-4 pb-4">
          {slicedArray.map((item) => {
            return (
              <VoiceModelElement
                key={item.model_token}
                model={item}
                onSelect={(item) => onSelect(item as TtsModelListItem)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
