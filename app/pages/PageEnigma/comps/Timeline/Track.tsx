import { TrackClip } from "~/pages/PageEnigma/comps/Timeline/TrackClip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { BaseClip } from "~/models/track";
import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { ClipContext } from "~/contexts/ClipContext/ClipContext";

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
  const { length } = useContext(TrackContext);
  const { dragType } = useContext(ClipContext);
  const trackType = type ?? style;

  const className = dragType === trackType ? "highlight" : "";

  return (
    <div className="pl-16">
      <div
        className={`relative mt-4 block h-8 w-full rounded bg-${style}-unselected`}
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
        <div
          className="absolute text-xs text-white"
          style={{ top: 6, left: 4 }}
        >
          {title}
        </div>
        {!!toggleMute && (
          <button
            className="absolute text-xl text-white"
            style={{ top: 2, left: -36 }}
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
