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

interface Props {
  timelineHeight: number;
}

export const Timeline = ({ timelineHeight }: Props) => {
  const {
    characters,
    objects,
    scale,
    length,
    selectedClip,
    deleteCharacterClip,
    deleteAudioClip,
    deleteCameraClip,
    deleteObjectClip,
  } = useContext(TrackContext);
  const { onPointerDown, time } = useMouseEventsAnimation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sectionWidth = 60 * 4 * scale;
  const fullHeight =
    characters.length * 200 + objects.objects.length * 80 + 248 + 96;

  const onDeleteAsk = useCallback(
    (event: KeyboardEvent) => {
      if (["Backspace", "Delete"].indexOf(event.key) > -1 && selectedClip) {
        setDialogOpen(true);
      }
    },
    [selectedClip],
  );

  const onDelete = useCallback(() => {
    deleteCharacterClip(selectedClip!);
    deleteCameraClip(selectedClip!);
    deleteAudioClip(selectedClip!);
    deleteObjectClip(selectedClip!);
  }, [
    selectedClip,
    deleteAudioClip,
    deleteCharacterClip,
    deleteCameraClip,
    deleteObjectClip,
  ]);

  useEffect(() => {
    document.addEventListener("keydown", onDeleteAsk);

    return () => {
      document.addEventListener("keydown", onDeleteAsk);
    };
  }, [onDeleteAsk]);

  return (
    <>
      <LowerPanel timelineHeight={timelineHeight}>
        <div
          className={[
            "prevent-select mt-4",
            "flex h-3",
            "border-t border-t-ui-panel-border",
            "text-xs text-white opacity-75",
          ].join(" ")}
        >
          {Array(length)
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
            style={{ left: length * sectionWidth + 92 }}
          >
            00:{length < 10 ? "0" + length.toString() : length.toString()}
          </div>
          <div
            className="absolute block h-full bg-ui-divider"
            style={{
              width: 1,
              left: length * sectionWidth + 88,
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
        <div className="p-4">
          <Objects />
        </div>
        <div
          className="absolute text-brand-primary"
          style={{ top: 8, left: time * 4 * scale + 88 }}
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
