import { LowerPanel } from "~/modules/LowerPanel";
import Editor from "../../js/editor";
import { Character } from "./Character";
import { useCallback, useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext";

export const Timeline = ({
  editorCurrent,
}: {
  editorCurrent: Editor | null;
}) => {
  const { characters, updateCharacters } = useContext(TrackContext);

  const updateClip = useCallback(
    (id: string, offset: number, length: number) => {
      updateCharacters({ type: "animations", id, offset, length });
    },
    [],
  );

  return (
    <LowerPanel>
      <div className="h-10 w-full border-b border-ui-panel-border"></div>
      <input
        style={{ display: "none" }}
        type="file"
        id="load-upload"
        name="load-upload"
      ></input>
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
    </LowerPanel>
  );
};
