import {
  AssetType,
  ClipGroup,
  ClipType,
  Keyframe,
} from "~/pages/PageEnigma/models";
import { TrackKeyFrame } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrame";
import { AddToast } from "~/contexts/ToasterContext";
import { PointerEvent } from "react";
import DndAsset from "~/pages/PageEnigma/DragAndDrop/DndAsset";
import { dragItem } from "~/pages/PageEnigma/store";

interface Props {
  id: string;
  keyframes: Keyframe[];
  title?: string;
  group: ClipGroup;
  toggleMute?: () => void;
  muted?: boolean;
  updateKeyframe: (options: {
    id: string;
    offset: number;
    force?: boolean;
    addToast: AddToast;
  }) => void;
}

function setNotDropText({
  dragType,
  group,
}: {
  dragType?: AssetType;
  group: ClipGroup;
}) {
  if (dragType === AssetType.ANIMATION) {
    if (group === ClipGroup.CHARACTER) {
      DndAsset.notDropText = "Cannot drag animation onto movement track";
    }
    if (group === ClipGroup.CAMERA) {
      DndAsset.notDropText = "Cannot drag animation onto camera track";
    }
    if (group === ClipGroup.OBJECT) {
      DndAsset.notDropText = "Cannot drag animation onto object track";
    }
  }
  if (dragType === AssetType.AUDIO) {
    if (group === ClipGroup.CHARACTER) {
      DndAsset.notDropText = "Cannot drag audio onto movement track";
    }
    if (group === ClipGroup.CAMERA) {
      DndAsset.notDropText = "Cannot drag audio onto camera track";
    }
    if (group === ClipGroup.OBJECT) {
      DndAsset.notDropText = "Cannot drag audio onto object track";
    }
  }
}

export const TrackKeyFrames = ({
  id,
  keyframes,
  updateKeyframe,
  title,
  group,
}: Props) => {
  function onPointerMove() {
    if (!DndAsset.overElement) {
      const element = document.getElementById(`track-${group}-${id}`);
      DndAsset.overElement = element!.getBoundingClientRect();
    }
    setNotDropText({ dragType: dragItem.value?.type, group });
  }
  return (
    <div
      id={`track-${group}-${id}`}
      className={`relative block h-9 w-full rounded-lg bg-${group}-unselected`}
      onPointerMove={onPointerMove}>
      {keyframes.map((keyframe) => (
        <TrackKeyFrame
          key={keyframe.keyframe_uuid}
          updateKeyframe={updateKeyframe}
          keyframe={keyframe}
        />
      ))}
      {!!title && (
        <div className="prevent-select absolute ps-2 pt-1 text-xs font-medium text-white">
          {title}
        </div>
      )}
    </div>
  );
};
