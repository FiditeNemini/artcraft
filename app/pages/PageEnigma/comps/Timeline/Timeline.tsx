import { LowerPanel } from "~/modules/LowerPanel";
import Editor from "../../js/editor";
import { Character } from "./Character";
import { useCallback, useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext";

export const Timeline = ({
  editorCurrent,
  time,
}: {
  editorCurrent: Editor | null;
  time: number;
}) => {
  const { characters, updateCharacters } = useContext(TrackContext);

  const updateClip = useCallback(
    (id: string, offset: number, length: number) => {
      updateCharacters({ type: "animations", id, offset, length });
    },
    [],
  );

  const width = (window.innerWidth - 40) / 10 - 2;
  return (
    <LowerPanel>
      <div className="h-10 border-b border-ui-panel-border"></div>
      <input
        style={{ display: "none" }}
        type="file"
        id="load-upload"
        name="load-upload"
      ></input>
      <div className="relative">
        <div className="flex w-full px-10 text-sm text-white">
          <div style={{ width }}>0</div>
          <div style={{ width }}>1</div>
          <div style={{ width }}>2</div>
          <div style={{ width }}>3</div>
          <div style={{ width }}>4</div>
          <div style={{ width }}>5</div>
          <div style={{ width }}>6</div>
          <div style={{ width }}>7</div>
          <div style={{ width }}>8</div>
          <div style={{ width }}>9</div>
          <div style={{ width: 16 }}>10</div>
        </div>
        <div className="mr-4 p-4">
          {characters.map((character) => (
            <Character
              key={character.id}
              scale={1}
              time={0}
              character={character}
              updateClip={updateClip}
            />
          ))}
        </div>
          <div className="h-full absolute bg-brand-primary block" style={{left: time + 40, top: 0, width: 1}} />
      </div>
    </LowerPanel>
  );
};
