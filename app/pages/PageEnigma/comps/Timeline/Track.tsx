import { TrackClip } from "~/pages/PageEnigma/comps/Timeline/TrackClip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { BaseClip } from "~/pages/PageEnigma/models/track";
import { PointerEvent, useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

interface Props {
  id: string;
  clips: BaseClip[];
  title: string;
  style: "character" | "audio" | "camera" | "objects";
  type?: "animations" | "positions" | "lipSync";
  toggleMute?: () => void;
  muted?: boolean;
  updateClip: (options: { id: string; length: number; offset: number }) => void;
}

export const Track = ({
  id,
  clips,
  toggleMute,
  updateClip,
  muted,
  title,
  style,
  type,
}: Props) => {
  const { length, scale, setCanDrop, dragType, setDropId, setDropOffset } =
    useContext(TrackContext);
  const trackType = type ?? style;

  function onPointerOver() {
    if (dragType !== trackType) {
      return;
    }
    setCanDrop(true);
    setDropId(id);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragType !== trackType) {
      return;
    }
    const track = document.getElementById(`track-${trackType}-${id}`);
    if (!track) {
      return;
    }
    const position = track.getBoundingClientRect();
    setDropOffset((event.clientX - position.x) / 4 / scale);
  }
  function onPointerLeave() {
    if (dragType !== trackType) {
      return;
    }
    setCanDrop(false);
  }

  return (
    <div className="pl-16">
      <div
        id={`track-${trackType}-${id}`}
        className={`rounded=lg relative mt-4 block h-9 w-full bg-${style}-unselected`}
        onPointerOver={onPointerOver}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        {clips.map((clip, index) => (
          <TrackClip
            key={clip.id}
            min={
              index > 0 ? clips[index - 1].offset + clips[index - 1].length : 0
            }
            max={
              index < clips.length - 1 ? clips[index + 1].offset : length * 60
            }
            style={style}
            updateClip={updateClip}
            clip={clip}
          />
        ))}
        <div className="prevent-select absolute ps-2 pt-1 text-xs font-medium text-white">
          {title}
        </div>
        {!!toggleMute && (
          <button
            className="absolute text-xs text-white"
            style={{ top: 6, left: -20 }}
            onClick={toggleMute}
          >
            {muted ? (
              <FontAwesomeIcon
                icon={faVolumeSlash}
                className="text-brand-primary"
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
