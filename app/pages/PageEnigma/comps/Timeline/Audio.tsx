import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

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
        <Track
          clips={clips}
          title="Global Audio Track"
          updateClip={updateAudio}
          style="audio"
          muted={audio?.muted}
          toggleMute={toggleAudioMute}
        />
      </div>
    </div>
  );
};
