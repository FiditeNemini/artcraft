import { MediaItem } from "~/pages/PageEnigma/models";
import { characterGroups } from "~/pages/PageEnigma/store";

export function deleteCharacter(item: MediaItem) {
  characterGroups.value = characterGroups.value.filter(
    (character) => character.id !== item.object_uuid,
  );
}
