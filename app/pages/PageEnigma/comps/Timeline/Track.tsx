import { TrackClip } from "~/pages/PageEnigma/comps/Timeline/TrackClip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { BaseClip } from "~/models/track";
import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

interface Props {
  clips: BaseClip[];
  title: string;
  style: "character" | "audio" | "camera" | "objects";
  type?: "animations" | "positions" | "lipSync";
  toggleMute?: () => void;
  muted?: boolean;
  updateClip: (options: { id: string; length: number; offset: number }) => void;
}

export const Track = ({
  clips,
  toggleMute,
  updateClip,
  muted,
  title,
  style,
  type,
}: Props) => {
  const { length, setCanDrop, dragType } = useContext(TrackContext);
  const trackType = type ?? style;

  function onPointerOver() {
    if (dragType !== trackType) {
      return;
    }
    setCanDrop(true);
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
        className={`rounded=lg relative mt-4 block h-9 w-full bg-${style}-unselected`}
        onPointerOver={onPointerOver}
        onPointerLeave={onPointerLeave}
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
