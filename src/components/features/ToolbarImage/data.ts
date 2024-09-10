import { ToolbarImageButtonNames } from "./enums";
import {
  faArrowUpFromLine,
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faArrowDownFromLine,
  faHatWitch,
  faTrashCan,
} from "@fortawesome/pro-solid-svg-icons";

export const ToolbarImageButtonData = [
  {
    name: ToolbarImageButtonNames.MOVE,
    icon: faArrowsUpDownLeftRight,
    tooltip: "Move",
  },
  {
    name: ToolbarImageButtonNames.ROTATE,
    icon: faArrowsRotate,
    tooltip: "Rotate",
  },
  {
    name: ToolbarImageButtonNames.AI_STYLIZE,
    icon: faHatWitch,
    tooltip: "AI Stylize",
  },
  {
    name: ToolbarImageButtonNames.MOVE_LAYER_UP,
    icon: faArrowUpFromLine,
    tooltip: "Move Layer Up",
  },
  {
    name: ToolbarImageButtonNames.MOVE_LAYER_DOWN,
    icon: faArrowDownFromLine,
    tooltip: "Move Layer Down",
  },
  {
    name: ToolbarImageButtonNames.DELETE,
    icon: faTrashCan,
    tooltip: "Delete",
  },
];
