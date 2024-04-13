import {
  audioGroup,
  characterGroup,
  objectGroup,
  timelineScrollY,
  toggleAudioMute,
  toggleLipSyncMute,
} from "~/pages/PageEnigma/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { useSignals } from "@preact/signals-react/runtime";

export const RowHeaders = () => {
  useSignals();

  return (
    <div className="relative">
      <div
        className="absolute mt-2"
        style={{ top: timelineScrollY.value * -1 - 8 }}
      >
        {characterGroup.value.characters.map((character) => (
          <div className="mb-4 ml-6" key={character.object_uuid}>
            <div className="relative block h-[224px] w-[64px] overflow-x-hidden rounded-l-lg bg-character-groupBg">
              <div className="absolute left-2 top-2 text-xs font-medium text-white">
                Character
              </div>
              <div className="absolute">
                <button
                  className="text-md absolute text-white transition-colors duration-100 hover:text-white/80"
                  style={{ top: 174, left: 34 }}
                  onClick={() => toggleLipSyncMute(character.object_uuid)}
                >
                  {character.muted ? (
                    <FontAwesomeIcon
                      icon={faVolumeSlash}
                      className="text-brand-primary transition-colors duration-100 hover:text-brand-primary/80"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faVolume} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="mb-4 ml-6">
          <div className="relative block h-[88px] w-[64px] rounded-l-lg bg-camera-groupBg">
            <div className="absolute left-2 top-2 text-xs font-medium text-white">
              Camera
            </div>
          </div>
        </div>
        <div className="mb-4 ml-6">
          <div className="relative block h-[88px] w-[64px] rounded-l-lg bg-global_audio-groupBg">
            <div className="absolute left-2 top-2 text-xs font-medium text-white">
              Global Audio
            </div>
            <div className="absolute">
              <button
                className="text-md absolute text-white transition-colors duration-100 hover:text-white/80"
                style={{ top: 40, left: 34 }}
                onClick={() => toggleAudioMute()}
              >
                {audioGroup.value.muted ? (
                  <FontAwesomeIcon
                    icon={faVolumeSlash}
                    className="text-brand-primary transition-colors duration-100 hover:text-brand-primary/80"
                  />
                ) : (
                  <FontAwesomeIcon icon={faVolume} />
                )}
              </button>
            </div>
          </div>
        </div>
        {objectGroup.value.objects.map((obj) => (
          <div key={obj.object_uuid} className="mb-4 ml-6">
            <div className="relative block h-[88px] w-[64px] rounded-l-lg bg-object-groupBg">
              <div className="absolute left-2 top-2 text-xs font-medium text-white">
                Object
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
