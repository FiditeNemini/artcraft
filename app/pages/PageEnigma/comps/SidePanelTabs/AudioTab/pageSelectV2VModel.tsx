import { useCallback, useState } from "react";

import { Input } from "~/components";
import { AudioTabPages } from "./types";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { VoiceModelElement } from "./voiceModelElement";
import { VoiceConversionModelListItem } from "./typesImported";

export const PageSelectV2VModel = ({
  changePage,
  v2vModels,
  onSelect,
}: {
  changePage: (newPage: AudioTabPages) => void;
  v2vModels: Array<VoiceConversionModelListItem>;
  onSelect: (item: VoiceConversionModelListItem) => void;
}) => {
  const [query, setQuery] = useState("");
  const filteredListOfModels =
    query === ""
      ? v2vModels
      : v2vModels.filter((model) => {
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
    <div className="flex flex-col gap-4 overflow-hidden">
      <TabTitle
        title="Search Convertible Voices"
        onBack={() => changePage(AudioTabPages.GENERATE_AUDIO)}
      />

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
              key={item.token}
              model={item}
              onSelect={(item) =>
                onSelect(item as VoiceConversionModelListItem)
              }
            />
          );
        })}
      </div>
    </div>
  );
};
