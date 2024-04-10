import { useEffect, useState, useContext } from "react";

import { LoadingDotsBricks } from "~/components";
import { EngineContext } from "../../../../contexts/EngineContext";

export const ViewSideBySide = () => {
  const [showLoader, setShowLoader] = useState(true);
  const editorEngine = useContext(EngineContext);

  useEffect(() => {
    editorEngine?.generateFrame();
    setTimeout(() => setShowLoader(false), 200);
  }, []);

  return (
    <div
      id="view-side-by-side"
      className="absolute left-0 top-0 flex h-full w-full items-center justify-center gap-2 p-2"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="text-white">
          <label>Raw Preview</label>
        </div>
        <div className="relative">
          <img className="max-h-150 aspect-video border" id="raw-preview"></img>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-white">
          <label>Stylized Preview</label>
        </div>
        <div className="relative">
          <img
            className="max-h-150 aspect-video border"
            id="stylized-preview"
          ></img>
        </div>
      </div>
      <div className="absolute left-0 top-0 h-full w-full">
        <LoadingDotsBricks isShowing={showLoader} />
      </div>
    </div>
  );
};
