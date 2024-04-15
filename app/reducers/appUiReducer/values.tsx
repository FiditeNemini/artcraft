import { State, VIEW_MODES } from "./types";
import { ClipGroup } from "~/pages/PageEnigma/models";

export const initialStateValues: State = {
  timelineHeight: 260,
  viewMode: VIEW_MODES.EDITOR,
  showEditorLoader: {
    isShowing: false,
    message: "Loading Editor Engine 🦊",
  },
  controlPanel: {
    isShowing: false,
    currentSceneObject: {
      group: ClipGroup.OBJECT,
      object_name: "",
      object_uuid: "",
      version: "1",
      objectVectors: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0, y: 0, z: 0 },
      },
    },
  },
  diagloueTts: { isOpen: false },
};
