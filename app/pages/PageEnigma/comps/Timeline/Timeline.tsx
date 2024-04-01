import { useCallback, useContext, useEffect, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { LowerPanel } from "~/modules/LowerPanel";

import { Camera } from "./Camera";
import { Audio } from "./Audio";
import { ConfirmationModal } from "~/components/ConfirmationModal";
import {
  timelineHeight,
  deleteAudioClip,
  deleteCharacterClip,
} from "~/pages/PageEnigma/store";
import { useQueueHandler } from "~/pages/PageEnigma/comps/Timeline/utils/useQueueHandler";
import { useSignals } from "@preact/signals-react/runtime";
import { TimerGrid } from "~/pages/PageEnigma/comps/TimerGrid/TimerGrid";
import { Scrubber } from "~/pages/PageEnigma/comps/Scrubber/Scrubber";
import { Characters } from "~/pages/PageEnigma/comps/Timeline/Characters";
import { ObjectGroups } from "~/pages/PageEnigma/comps/Timeline/ObjectGroups";

export const Timeline = () => {
  useSignals();
  const { selectedItem } = useContext(TrackContext);
  const [dialogOpen, setDialogOpen] = useState(false);

  // implement the code to handle incoming messages from the Engine
  useQueueHandler();

  useEffect(() => {
    timelineHeight.value = window.outerHeight * 0.25;
  }, []);

  const onDeleteAsk = useCallback(
    (event: KeyboardEvent) => {
      if (["Backspace", "Delete"].indexOf(event.key) > -1 && selectedItem) {
        setDialogOpen(true);
      }
    },
    [selectedItem],
  );

  const onDelete = useCallback(() => {
    deleteCharacterClip(selectedItem!);
    deleteAudioClip(selectedItem!);
  }, [selectedItem]);

  useEffect(() => {
    document.addEventListener("keydown", onDeleteAsk);

    return () => {
      document.addEventListener("keydown", onDeleteAsk);
    };
  }, [onDeleteAsk]);

  console.log("timeline");
  return (
    <>
      <LowerPanel>
        <TimerGrid />
        <div className="p-4">
          <Characters />
        </div>
        <div className="p-4">
          <Camera />
        </div>
        <div className="p-4">
          <Audio />
        </div>
        <ObjectGroups />
        <Scrubber />
      </LowerPanel>
      <ConfirmationModal
        title="Delete Clip"
        text="Are you sure you want to delete the selected clip?"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onOk={() => {
          onDelete();
          setDialogOpen(false);
        }}
        okText="Delete"
        okColor="bg-brand-primary"
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
};
