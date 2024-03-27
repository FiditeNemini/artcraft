import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

export const Audio = () => {
  const { audio, updateAudio, toggleAudioMute, fullWidth } =
    useContext(TrackContext);
  const { clips } = audio!;

  return (
    <div
      className="block rounded-lg bg-audio-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Global Audio
      </div>
      <div className="flex flex-col gap-4">
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
