import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { PageStyleSelection } from "./PageStyleSelection";
import { Prompts } from "./Prompts";
import { StyleButtons } from "./StyleButtons";
import { useSignals } from "@preact/signals-react/runtime";
import { useState } from "react";
import { ArtStyle } from "~/pages/PageEnigma/Editor/api_manager";
import { styleList } from "~/pages/PageEnigma/styleList";
import { StylizeTabPages } from "~/pages/PageEnigma/enums";
import { StyleSelectionButton } from "./StyleSelectionButton";
import { GenerateMovieButton } from "./GenerateMovieButton";

export function StylizeTab() {
  useSignals();
  const [selection, setSelection] = useState<ArtStyle>(styleList[0].type);
  const [view, setView] = useState(StylizeTabPages.MAIN);
  const [generateSectionHeight, setGenerateSectionHeight] = useState(110);

  const currentStyle = styleList.find((style) => style.type === selection);

  const handleSelectStyle = (newSelection: ArtStyle) => {
    setSelection(newSelection);
    setView(StylizeTabPages.MAIN);
  };

  if (view === StylizeTabPages.STYLE_SELECTION) {
    return (
      <PageStyleSelection
        selection={selection}
        setSelection={handleSelectStyle}
        changePage={setView}
      />
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <TabTitle title="Transform your animation with AI" />
      <div
        className="mt-2 flex w-full flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 pb-2"
        style={{ marginBottom: `${generateSectionHeight}px` }}
      >
        <StyleSelectionButton
          onClick={() => setView(StylizeTabPages.STYLE_SELECTION)}
          selectedStyle={selection}
          label={currentStyle?.label || "Select a Style"}
          imageSrc={currentStyle?.image || ""}
        />
        <Prompts selection={selection} />
        <StyleButtons />
      </div>
      <GenerateMovieButton
        setGenerateSectionHeight={setGenerateSectionHeight}
      />
    </div>
  );
}
