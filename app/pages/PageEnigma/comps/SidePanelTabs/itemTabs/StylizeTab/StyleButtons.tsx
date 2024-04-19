import { Button } from "~/components";
import { faArrowsRotate, faFilm } from "@fortawesome/pro-solid-svg-icons";
import { useContext } from "react";
import { EngineContext } from "~/contexts/EngineContext";

export function StyleButtons() {
  const editorEngine = useContext(EngineContext);

  const generateFrame = async () => {
    editorEngine?.switchPreview();
    await editorEngine?.generateFrame();
  };

  const generateMovie = async () => {
    editorEngine?.generateVideo();
  };

  return (
    <div className="flex w-full flex-col justify-center gap-4 rounded-b-lg bg-ui-panel">
      <div className="w-full">
        <div className="mb-2 text-sm font-medium">
          Render the current camera view with AI
        </div>
        <Button
          icon={faArrowsRotate}
          variant="primary"
          className="w-full"
          onClick={generateFrame}>
          Preview Frame
        </Button>
      </div>
      <div className="w-full">
        <div className="text-sm font-medium">
          When you&apos;re done, render your entire animation with AI
        </div>
        <div className="mb-2 text-xs text-white/70">
          (This may take several minutes)
        </div>
        <Button
          icon={faFilm}
          variant="primary"
          className="w-full"
          onClick={generateMovie}>
          Generate Movie
        </Button>
      </div>
    </div>
  );
}
