import {
  audioGroup,
  audioMinimized,
  cameraMinimized,
  characterGroup,
  objectGroup,
  objectsMinimized,
  timelineScrollY,
  toggleAudioMute,
  toggleLipSyncMute,
} from "~/pages/PageEnigma/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolume, faVolumeSlash } from "@fortawesome/pro-solid-svg-icons";
import { useSignals } from "@preact/signals-react/runtime";
import { GlobalAudioHeader } from "~/pages/PageEnigma/comps/Timeline/RowHeaders/GlobalAudioHeader";
import { CameraHeader } from "~/pages/PageEnigma/comps/Timeline/RowHeaders/CameraHeader";
import { ObjectsHeader } from "~/pages/PageEnigma/comps/Timeline/RowHeaders/ObjectsHeader";
import { CharacterHeader } from "~/pages/PageEnigma/comps/Timeline/RowHeaders/CharacterHeader";

export const RowHeaders = () => {
  useSignals();

  const compressedHeaderClasses =
    "flex h-[35px] items-center gap-2 pl-2 text-xs rounded-tl-lg font-medium text-white";
  const uncompressedHeaderClasses =
    "flex h-[35px] items-center gap-2 rounded-br-lg rounded-tl-lg pl-2 text-xs font-medium text-white";

  return (
    <div className="relative">
      <div
        className="absolute mt-2 w-[146px]"
        style={{ top: timelineScrollY.value * -1 - 8 }}>
        {characterGroup.value.characters.map((character) => {
          if (character.minimized) {
            return (
              <div
                key={character.object_uuid}
                className="mb-4 h-[35px] w-full rounded-l-lg bg-character-groupBg">
                <div
                  className={[
                    compressedHeaderClasses,
                    "bg-character-titleBg",
                  ].join(" ")}>
                  <CharacterHeader name={character.name} />
                </div>
              </div>
            );
          }
          return (
            <div
              key={character.object_uuid}
              className="mb-4 h-[199px] w-full rounded-l-lg bg-character-groupBg">
              <div className="h-[47px] text-xs font-medium text-white">
                <div
                  className={[
                    uncompressedHeaderClasses,
                    "bg-character-titleBg",
                  ].join(" ")}>
                  <CharacterHeader name={character.name} />
                </div>
              </div>
              <div className="mb-3 flex h-[36px] flex-col justify-center pl-[22px] text-xs font-medium text-white opacity-80">
                Animation
              </div>
              <div className="mb-3 flex h-[36px] flex-col justify-center pl-[22px] text-xs font-medium text-white opacity-80">
                Movement
              </div>
              <div className="flex h-[36px] flex-col justify-center pl-[22px] text-xs font-medium text-white opacity-80">
                <div className="flex gap-3">
                  Lip Sync
                  <button
                    className="text-md text-white transition-colors duration-100 hover:text-white/80"
                    onClick={() => toggleLipSyncMute(character.object_uuid)}>
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
          );
        })}

        {cameraMinimized.value ? (
          <div className="mb-4 h-[35px] w-full rounded-l-lg bg-camera-groupBg">
            <div
              className={[compressedHeaderClasses, "bg-camera-titleBg"].join(
                " ",
              )}>
              <CameraHeader />
            </div>
          </div>
        ) : (
          <div className="mb-4 h-[103px] w-full rounded-l-lg bg-camera-groupBg">
            <div className="h-[47px] text-xs font-medium text-white">
              <div
                className={[
                  uncompressedHeaderClasses,
                  "bg-camera-titleBg",
                ].join(" ")}>
                <CameraHeader />
              </div>
            </div>
            <div className="mb-3 flex h-[36px] flex-col justify-center pl-[22px] text-xs font-medium text-white opacity-80">
              Movement
            </div>
          </div>
        )}

        {audioMinimized.value ? (
          <div className="mb-4 h-[35px] w-full rounded-l-lg bg-global_audio-groupBg">
            <div
              className={[
                compressedHeaderClasses,
                "bg-global_audio-titleBg",
              ].join(" ")}>
              <GlobalAudioHeader />
            </div>
          </div>
        ) : (
          <div className="mb-4 h-[103px] w-full rounded-l-lg bg-global_audio-groupBg">
            <div className="h-[47px] text-xs font-medium text-white">
              <div
                className={[
                  uncompressedHeaderClasses,
                  "bg-global_audio-titleBg",
                ].join(" ")}>
                <GlobalAudioHeader />
              </div>
            </div>
            <div className="mb-3 flex h-[36px] flex-col justify-center pl-[22px] text-xs font-medium text-white opacity-80">
              <div className="flex gap-3">
                Track 1
                <button
                  className="text-md text-white transition-colors duration-100 hover:text-white/80"
                  onClick={() => toggleAudioMute()}>
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
        )}
        {objectGroup.value.objects.length > 0 && (
          <>
            {objectsMinimized.value ? (
              <div className="mb-4 h-[35px] w-full rounded-l-lg bg-object-groupBg">
                <div
                  className={[
                    compressedHeaderClasses,
                    "bg-object-titleBg",
                  ].join(" ")}>
                  <ObjectsHeader />
                </div>
              </div>
            ) : (
              <div
                className="mb-4 h-[103px] w-full rounded-l-lg bg-object-groupBg"
                style={{ height: 55 + objectGroup.value.objects.length * 48 }}>
                <div className="h-[47px] text-xs font-medium text-white">
                  <div
                    className={[
                      uncompressedHeaderClasses,
                      "bg-object-titleBg",
                    ].join(" ")}>
                    <ObjectsHeader />
                  </div>
                </div>
                {objectGroup.value.objects.map((obj) => (
                  <div
                    key={obj.object_uuid}
                    className="mb-3 flex h-[36px] flex-col justify-center pl-[22px] text-xs font-medium text-white opacity-80">
                    {obj.name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
