import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { LowerPanel } from "~/modules/LowerPanel";
import { Character } from "./Character";

import { Camera } from "./Camera";
import { Audio } from "./Audio";
import { Objects } from "./Objects";
import { useMouseEventsAnimation } from "./utils/useMouseEventsAnimation";
import { faSortDown } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ConfirmationModal } from "~/components/ConfirmationModal";
import {
  scale,
  currentTime,
  filmLength,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import { useQueueHandler } from "~/pages/PageEnigma/comps/Timeline/utils/useQueueHandler";
import { EngineContext } from "../../contexts/EngineContext";

export const Timeline = () => {
  const editorEngine = useContext(EngineContext);
    
  const {
    characters,
    objects,
    selectedClip,
    deleteCharacterClip,
    deleteAudioClip,
    deleteCameraClip,
  } = useContext(TrackContext);
  const { onPointerDown, time } = useMouseEventsAnimation();
  const [dialogOpen, setDialogOpen] = useState(false);

  // implement the code to handle incoming messages from the Engine
  useQueueHandler();

  const sectionWidth = 60 * 4 * scale.value;
  const fullHeight =
    characters.length * 268 + objects.objects.length * 60 + 300 + 96;

  useEffect(() => {
    timelineHeight.value = window.outerHeight * 0.25;
  }, []);

  const onDeleteAsk = useCallback(
    (event: KeyboardEvent) => {
      if (["Backspace", "Delete"].indexOf(event.key) > -1 && selectedClip) {
        setDialogOpen(true);
      }
    },
    [selectedClip],
  );

  const displayTime = time === -1 ? currentTime.value : time;

  const onDelete = useCallback(() => {
    deleteCharacterClip(selectedClip!);
    deleteCameraClip(selectedClip!);
    deleteAudioClip(selectedClip!);
  }, [selectedClip, deleteAudioClip, deleteCharacterClip, deleteCameraClip]);

  useEffect(() => {
    document.addEventListener("keydown", onDeleteAsk);

    return () => {
      document.addEventListener("keydown", onDeleteAsk);
    };
  }, [onDeleteAsk]);

  return (
    <>
      <LowerPanel>
        <div
          className={[
            "prevent-select mt-4",
            "flex h-3",
            "border-t border-t-ui-panel-border",
            "text-xs text-white opacity-75",
          ].join(" ")}
        >
          {Array(filmLength.value)
            .fill(0)
            .map((_, index) => (
              <Fragment key={index}>
                <div
                  className="absolute ps-1 pt-1"
                  style={{ left: index * sectionWidth + 92 }}
                >
                  00:{index < 10 ? "0" + index.toString() : index.toString()}
                </div>
                <div
                  className="absolute block h-full bg-ui-divider"
                  style={{
                    width: 1,
                    left: index * sectionWidth + 88,
                    height: fullHeight,
                  }}
                />
              </Fragment>
            ))}
          <div
            className="absolute"
            style={{ left: filmLength.value * sectionWidth + 92 }}
          >
            00:
            {filmLength.value < 10
              ? "0" + filmLength.value.toString()
              : filmLength.value.toString()}
          </div>
          <div
            className="absolute block h-full bg-ui-divider"
            style={{
              width: 1,
              left: filmLength.value * sectionWidth + 88,
              height: fullHeight,
            }}
          />
        </div>
        <div className="p-4">
          {characters.map((character) => (
            <Character key={character.id} characterId={character.id} />
          ))}
        </div>
        <div className="p-4">
          <Camera />
        </div>
        <div className="p-4">
          <Audio />
        </div>
        {objects.objects.length > 0 && (
          <div className="p-4">
            <Objects />
          </div>
        )}
        <div
          className="absolute text-brand-primary"
          style={{ top: 8, left: displayTime * 4 * scale.value + 88 }}
          onPointerDown={onPointerDown}
        >
          <FontAwesomeIcon
            icon={faSortDown}
            className="absolute ml-[-5px] mt-[-10px] h-5 text-brand-primary"
          />
          <div
            className="absolute block bg-brand-primary"
            style={{
              left: 0,
              top: 8,
              width: 2,
              height: fullHeight,
            }}
          />
        </div>
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
