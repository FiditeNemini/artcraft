import { useSignals } from "@preact/signals-react/runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { Button, Link } from "~/components";
import { StyleSelection } from "~/pages/PageEnigma/comps/StyleSelection";
import { LowerPanel } from "~/modules/LowerPanel";
import { TimerGrid } from "~/pages/PageEnigma/comps/TimerGrid/TimerGrid";
import { Scrubber } from "~/pages/PageEnigma/comps/Timeline/Scrubber";
import { PreviewImages } from "~/pages/PageEnigma/comps/PreviewImages";
import { TopBar } from "~/modules/TopBar";

interface Props {
  setPage: (page: string) => void;
}

export const PageStyling = ({ setPage }: Props) => {
  useSignals();

  return (
    <div className="w-screen">
      <TopBar pageName="Stylization" />
      <div className="flex w-full justify-center">
        <div className="bg-ui-controls p-2">
          <Button variant="action" onClick={() => setPage("edit")}>
            <FontAwesomeIcon icon={faAngleLeft} />
            Back to Scene
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-4">
        <PreviewImages />
        <StyleSelection />
      </div>
      <div className="fixed bottom-0 left-0 w-full">
        <div className="flex h-[62px] w-full items-center justify-center gap-5 bg-ui-panel">
          <div>
            <Button variant="action">Update Preview</Button>
          </div>
          <div>
            <Button variant="primary">Generate Movie</Button>
          </div>
        </div>
        <div className="relative flex h-[80px] w-full gap-5 border-t border-t-action-600 bg-ui-panel">
          <LowerPanel onStyle>
            <TimerGrid />
            <Scrubber />
          </LowerPanel>
        </div>
      </div>
    </div>
  );
};
