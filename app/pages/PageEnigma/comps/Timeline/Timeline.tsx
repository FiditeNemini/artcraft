import { UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { LowerPanel } from "~/pages/PageEnigma/comps/LowerPanel";

import { Camera } from "./Camera";
import { Audio } from "./Audio";
import { ConfirmationModal } from "~/components";
import {
  characterGroup,
  deleteAudioClip,
  deleteCharacterClip,
  filmLength,
  ignoreKeyDelete,
  isHotkeyDisabled,
  objectsMinimized,
  scale,
  selectedItem,
  selectedObject,
  timelineHeight,
  timelineScrollX,
  timelineScrollY,
} from "~/pages/PageEnigma/signals";
import { useSignals } from "@preact/signals-react/runtime";
import { TimerGrid } from "~/pages/PageEnigma/comps/Timeline/TimerGrid";
import { Scrubber } from "~/pages/PageEnigma/comps/Timeline/Scrubber";
import { Characters } from "~/pages/PageEnigma/comps/Timeline/Characters";
import { ObjectGroups } from "~/pages/PageEnigma/comps/Timeline/ObjectGroups";
import useUpdateKeyframe from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateKeyframe";
import { Clip, Keyframe } from "~/pages/PageEnigma/models";
import { RowHeaders } from "~/pages/PageEnigma/comps/Timeline/RowHeaders/RowHeaders";
import { pageWidth } from "~/signals";
import { Pages } from "~/pages/PageEnigma/constants/page";
import PremiumLockTimeline from "./PremiumLockTimeline";
import { AssetType, DoNotShow } from "~/enums";

function getItemType(item: Clip | Keyframe | null) {
  if (!item) {
    return "";
  }
  return (item as Clip).clip_uuid ? "clip" : "keyframe";
}

function scrollItem(itemId: string) {
  const element = document.getElementById(itemId);
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export const Timeline = () => {
  useSignals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { deleteKeyframe } = useUpdateKeyframe();
  const lastSelectedObject = useRef(selectedObject.value);

  if (selectedObject.value !== lastSelectedObject.current) {
    lastSelectedObject.current = selectedObject.value;
    switch (selectedObject.value?.type) {
      case AssetType.CHARACTER:
        if (
          characterGroup.value.characters.some(
            (character) => character.object_uuid === selectedObject.value?.id,
          )
        ) {
          scrollItem(`track-character-${selectedObject.value?.id}`);
          break;
        }
        if (objectsMinimized.value) {
          scrollItem("track-objects");
          break;
        }
        scrollItem(`track-object-${selectedObject.value?.id}`);
        break;
      case AssetType.CAMERA:
        scrollItem("track-camera");
        break;
      case AssetType.OBJECT:
        if (objectsMinimized.value) {
          scrollItem("track-objects");
          break;
        }
        scrollItem(`track-object-${selectedObject.value?.id}`);
        break;
    }
  }

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    timelineScrollX.value = event.currentTarget.scrollLeft;
    timelineScrollY.value = event.currentTarget.scrollTop;
  }, []);

  useEffect(() => {
    timelineHeight.value = window.outerHeight * 0.25;
  }, []);

  const onDelete = useCallback(() => {
    if ((selectedItem.value as Clip).clip_uuid) {
      deleteCharacterClip(selectedItem.value as Clip);
      deleteAudioClip(selectedItem.value as Clip);
    } else {
      deleteKeyframe(selectedItem.value as Keyframe);
    }
    selectedItem.value = null;
  }, [deleteKeyframe]);

  const onDeleteAsk = useCallback(
    (event: KeyboardEvent) => {
      if (ignoreKeyDelete.value || isHotkeyDisabled()) {
        return;
      }
      if (
        ["Backspace", "Delete"].indexOf(event.key) > -1 &&
        selectedItem.value !== null
      ) {
        event.stopPropagation();
        event.preventDefault();
        const show = localStorage.getItem("Delete-clip");
        if (show === DoNotShow) {
          onDelete();
          return;
        }
        setDialogOpen(true);
      }
    },
    [onDelete],
  );

  useEffect(() => {
    document.addEventListener("keydown", onDeleteAsk);

    return () => {
      document.removeEventListener("keydown", onDeleteAsk);
    };
  }, [onDeleteAsk]);

  return (
    <>
      <LowerPanel>
        <TimerGrid page={Pages.EDIT} />
        <div className="flex">
          <div
            className="ml-[60px] mt-2 w-[144px] overflow-hidden"
            style={{
              height: timelineHeight.value - 54,
            }}
          >
            <RowHeaders />
          </div>
          <div
            className="mb-20 mt-2 overflow-auto"
            onScroll={onScroll}
            style={{
              width: pageWidth.value - 204,
              height: timelineHeight.value - 54,
            }}
          >
            <div
              className="relative"
              style={{ width: filmLength.value * 60 * 4 * scale.value + 72 }}
            >
              <PremiumLockTimeline locked={false} />
              <Characters />
              <div className="pb-4 pr-8">
                <Camera />
              </div>
              <div className="pb-4 pr-8">
                <Audio />
              </div>
              <ObjectGroups />
            </div>
          </div>
          <Scrubber page={Pages.EDIT} />
        </div>
      </LowerPanel>
      <ConfirmationModal
        title={`Delete ${getItemType(selectedItem.value)}`}
        text={`Are you sure you want to delete the selected ${getItemType(selectedItem.value)}?`}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onOk={() => {
          onDelete();
          setDialogOpen(false);
        }}
        okText="Delete"
        okColor="bg-brand-primary"
        onCancel={() => setDialogOpen(false)}
        canHide
      />
    </>
  );
};
