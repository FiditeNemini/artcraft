import { TrackClip } from "~/pages/PageEnigma/comps/Timeline/TrackClip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { Clip, ClipGroup, ClipType } from "~/pages/PageEnigma/models";
import { PointerEvent } from "react";
import {
  canDrop,
  clipLength,
  dragType,
  dropId,
  dropOffset,
  filmLength,
  scale,
} from "~/pages/PageEnigma/store";

interface Props {
  id: string;
  clips: Clip[];
  title: string;
  group: ClipGroup;
  type?: ClipType;
  toggleMute?: () => void;
  muted?: boolean;
  updateClip: (options: { id: string; length: number; offset: number }) => void;
}

function getCanBuild({
  dragType,
  type,
  group,
}: {
  dragType: ClipType | null;
  type?: ClipType;
  group: ClipGroup;
}) {
  if (dragType === ClipType.ANIMATION) {
    if (dragType === type) {
      return true;
    }
  }
  if (dragType === ClipType.AUDIO) {
    if (group === ClipGroup.CHARACTER && type === ClipType.AUDIO) {
      return true;
    }
    if (group === ClipGroup.GLOBAL_AUDIO) {
      return true;
    }
  }
  return false;
}

export const TrackClips = ({
  id,
  clips,
  toggleMute,
  updateClip,
  muted,
  title,
  group,
  type,
}: Props) => {
  const trackType = (type ?? group) as ClipType;

  function onPointerOver() {
    if (getCanBuild({ dragType: dragType.value, type, group })) {
      dropId.value = id;
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!getCanBuild({ dragType: dragType.value, type, group })) {
      return;
    }

    const track = document.getElementById(`track-${trackType}-${id}`);
    if (!track) {
      return;
    }

    // Now check the the clip fits
    const position = track.getBoundingClientRect();
    const clipOffset = (event.clientX - position.x) / 4 / scale.value;

    if (clipOffset + clipLength.value > filmLength.value * 60) {
      canDrop.value = false;
      return;
    }

    const overlap = clips.some((clip) => {
      if (clipOffset === clip.offset) {
        return true;
      }
      if (clipOffset > clip.offset && clipOffset <= clip.offset + clip.length) {
        return true;
      }
      return (
        clipOffset < clip.offset && clipOffset + clipLength.value >= clip.offset
      );
    });

    canDrop.value = !overlap;
    dropOffset.value = clipOffset;
  }
  function onPointerLeave() {
    if (dragType.value !== trackType) {
      return;
    }
    canDrop.value = false;
  }

  return (
    <div className="pl-16">
      <div
        id={`track-${trackType}-${id}`}
        className={`relative mt-4 block h-9 w-full rounded-lg bg-${group}-unselected`}
        onPointerOver={onPointerOver}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        {clips.map((clip, index) => (
          <TrackClip
            key={clip.clip_uuid}
            min={
              index > 0 ? clips[index - 1].offset + clips[index - 1].length : 0
            }
            max={
              index < clips.length - 1
                ? clips[index + 1].offset
                : filmLength.value * 60
            }
            group={group}
            updateClip={updateClip}
            clip={clip}
          />
        ))}
        <div className="prevent-select absolute ps-2 pt-1 text-xs font-medium text-white">
          {title}
        </div>
        {!!toggleMute && (
          <button
            className="text-md absolute text-white transition-colors duration-100 hover:text-white/80"
            style={{ top: 6, left: -28 }}
            onClick={toggleMute}
          >
            {muted ? (
              <FontAwesomeIcon
                icon={faVolumeSlash}
                className="text-brand-primary transition-colors duration-100 hover:text-brand-primary/80"
              />
            ) : (
              <FontAwesomeIcon icon={faVolume} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
