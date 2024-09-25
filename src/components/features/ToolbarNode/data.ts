import { ToolbarNodeButtonNames as ButtonNames } from "./enums";
import {
  faArrowUpFromLine,
  faArrowDownFromLine,
  faHatWitch,
  faTrashCan,
  faVectorSquare,
} from "@fortawesome/pro-solid-svg-icons";

export const ToolbarNodeButtonData = [
  {
    name: ButtonNames.TRANSFORM,
    icon: faVectorSquare,
    tooltip: "Move",
  },
  {
    name: ButtonNames.AI_STYLIZE,
    icon: faHatWitch,
    tooltip: "AI Stylize",
  },
  {
    name: ButtonNames.MOVE_LAYER_UP,
    icon: faArrowUpFromLine,
    tooltip: "Move Layer Up",
  },
  {
    name: ButtonNames.MOVE_LAYER_DOWN,
    icon: faArrowDownFromLine,
    tooltip: "Move Layer Down",
  },
  {
    name: ButtonNames.DELETE,
    icon: faTrashCan,
    tooltip: "Delete",
  },
];
