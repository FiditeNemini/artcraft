import { CharacterGroup, MediaItem } from "~/pages/PageEnigma/models";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { characterGroups } from "~/pages/PageEnigma/store";

export function addCharacter(character: MediaItem) {
  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_CHARACTER,
    data: character,
  });
}

export function addNewCharacter(data: MediaItem) {
  const newCharacter = {
    id: data.object_uuid,
    name: data.name,
    muted: false,
    animationClips: [],
    positionKeyframes: [],
    lipSyncClips: [],
  } as CharacterGroup;

  characterGroups.value = [...characterGroups.value, newCharacter].sort(
    (charA, charB) => (charA.id < charB.id ? -1 : 1),
  );
}
