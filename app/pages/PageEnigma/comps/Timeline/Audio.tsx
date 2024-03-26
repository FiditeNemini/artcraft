import { TrackClip } from "./TrackClip";
import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";

export const Audio = () => {
  const { audio, updateAudio, length, scale, toggleAudioMute } =
    useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;
  const { clips } = audio!;

  return (
    <div
      className="bg-audio-groupBg block rounded-lg pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-2 text-sm text-white">Global Audio</div>
      <div className="flex flex-col gap-2">
        <div className="pl-16">
          <div className="bg-audio-unselected relative mt-4 block h-8 w-full rounded">
            {clips.map((clip, index) => (
              <TrackClip
                key={clip.id}
                min={
                  index > 0
                    ? clips[index - 1].offset + clips[index - 1].length
                    : 0
                }
                max={
                  index < clips.length - 1
                    ? clips[index + 1].offset
                    : length * 60
                }
                style="audio"
                updateClip={updateAudio}
                clip={clip}
              />
            ))}
            <div
              className="absolute text-xs text-white"
              style={{ top: 6, left: 4 }}
            >
              Global Audio Track
            </div>
            <button
              className="absolute text-xl text-white"
              style={{ top: 2, left: -36 }}
              onClick={() => toggleAudioMute()}
            >
              {audio?.muted ? (
                <FontAwesomeIcon
                  icon={faVolumeSlash}
                  className="text-brand-primary"
                />
              ) : (
                <FontAwesomeIcon icon={faVolume} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
