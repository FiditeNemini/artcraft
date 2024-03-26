import { LowerPanel } from "~/modules/LowerPanel";
import Editor from "../../js/editor";
import { Character } from "./Character";
import { Fragment, useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Button } from "~/components";
import { Camera } from "./Camera";
import { Audio } from "./Audio";
import { Objects } from "./Objects";
import { useMouseEventsAnimation } from "./utils/useMouseEventsAnimation";
import { faSortDown } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Timeline = ({
  editorCurrent,
}: {
  editorCurrent: Editor | null;
}) => {
  const { characters, objects, scale, length } = useContext(TrackContext);
  const { onPointerDown, time } = useMouseEventsAnimation();

  const handleButtonLoad = () => {
    document.getElementById("load-upload")?.click();
  };
  const handleButtonRender = () => {
    editorCurrent?.togglePlayback();
  };
  const handleButtonPlay = () => {};

  const sectionWidth = 60 * 4 * scale;
  const fullHeight =
    characters.length * 200 + objects.objects.length * 80 + 248 + 96;

  return (
    <>
      <div className="fixed" style={{ top: 72, left: "calc(100% - 600px)" }}>
        <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Render</Button>
        <Button onClick={handleButtonPlay}>Play</Button>
      </div>
      <LowerPanel>
        <div className="mt-4 flex h-3 text-sm text-white">
          {Array(length)
            .fill(0)
            .map((_, index) => (
              <Fragment key={index}>
                <div
                  className="absolute"
                  style={{ left: index * sectionWidth + 92 }}
                >
                  00:{index < 10 ? "0" + index.toString() : index.toString()}
                </div>
                <div
                  className="bg-ui-divider absolute block h-full"
                  style={{
                    width: 1,
                    left: index * sectionWidth + 88,
                    height: fullHeight,
                  }}
                />
              </Fragment>
            ))}
          <div
            className="absolute"
            style={{ left: length * sectionWidth + 92 }}
          >
            00:{length < 10 ? "0" + length.toString() : length.toString()}
          </div>
          <div
            className="bg-ui-divider absolute block h-full"
            style={{
              width: 1,
              left: length * sectionWidth + 88,
              height: fullHeight,
            }}
          />
        </div>
        <div className="p-4">
          {characters.map((character) => (
            <Character key={character.id} characterId={character.id} />
          ))}
        </div>
        <div className="p-4">
          <Camera />
        </div>
        <div className="p-4">
          <Audio />
        </div>
        <div className="p-4">
          <Objects />
        </div>
        <div
          className="absolute text-brand-primary"
          style={{ top: 8, left: time * 4 * scale + 88 }}
          onPointerDown={onPointerDown}
        >
          <FontAwesomeIcon
            icon={faSortDown}
            className="absolute text-2xl"
            style={{ left: -6, top: -14 }}
          />
          <div
            className="absolute block bg-brand-primary"
            style={{
              left: 0,
              top: 8,
              width: 3,
              height: fullHeight,
            }}
          />
        </div>
      </LowerPanel>
    </>
  );
};
