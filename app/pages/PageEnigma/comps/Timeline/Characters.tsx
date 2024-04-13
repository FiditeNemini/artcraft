import { characterGroup } from "~/pages/PageEnigma/store";
import { Character } from "~/pages/PageEnigma/comps/Timeline/Character";
import { useSignals } from "@preact/signals-react/runtime";

export const Characters = () => {
  useSignals();
  return (
    <>
      {characterGroup.value.characters.map((character) => (
        <div key={character.object_uuid} className="pb-4 pr-4">
          <Character character={character} />
        </div>
      ))}
    </>
  );
};
