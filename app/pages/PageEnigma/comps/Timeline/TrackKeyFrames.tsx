import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { BaseKeyFrame } from "~/pages/PageEnigma/models/track";
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
import { TrackKeyFrame } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrame";

interface Props {
  id: string;
  keyFrames: BaseKeyFrame[];
  title: string;
  style: "character" | "audio" | "camera" | "objects";
  type?: "animations" | "positions" | "lipSync";
  toggleMute?: () => void;
  muted?: boolean;
  updateClip: (options: { id: string; length: number; offset: number }) => void;
}

export const TrackKeyFrames = ({
  id,
  keyFrames,
  toggleMute,
  updateClip,
  muted,
  title,
  style,
  type,
}: Props) => {
  const trackType = type ?? style;

  function onPointerOver() {
    if (dragType.value !== trackType) {
      return;
    }
    dropId.value = id;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragType.value !== trackType) {
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

    canDrop.value = true;
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
        className={`relative mt-4 block h-9 w-full rounded-lg bg-${style}-unselected`}
        onPointerOver={onPointerOver}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        {keyFrames.map((keyFrame, index) => (
          <TrackKeyFrame
            key={keyFrame.id}
            min={index > 0 ? keyFrames[index - 1].offset + 1 : 0}
            max={
              index < keyFrames.length - 1
                ? keyFrames[index + 1].offset
                : filmLength.value * 60
            }
            style={style}
            updateClip={updateClip}
            keyFrame={keyFrame}
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
