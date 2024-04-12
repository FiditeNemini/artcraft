import { characterGroup } from "~/pages/PageEnigma/store";
import { Character } from "~/pages/PageEnigma/comps/Timeline/Character";
import { useSignals } from "@preact/signals-react/runtime";

export const Characters = () => {
  useSignals();
  return (
    <>
      {characterGroup.value.characters.map((character) => (
        <Character key={character.object_uuid} character={character} />
      ))}
    </>
  );
};
