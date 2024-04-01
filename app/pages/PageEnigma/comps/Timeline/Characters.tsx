import { characterGroups } from "~/pages/PageEnigma/store";
import { Character } from "~/pages/PageEnigma/comps/Timeline/Character";
import { useSignals } from "@preact/signals-react/runtime";

export const Characters = () => {
  useSignals();
  return (
    <>
      {characterGroups.value.map((character) => (
        <Character key={character.id} characterId={character.id} />
      ))}
    </>
  );
};
