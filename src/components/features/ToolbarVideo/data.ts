import { ToolbarVideoButtonNames } from "./enums";
import {
  faArrowUpFromLine,
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faArrowDownFromLine,
  faHatWitch,
  faTrashCan,
} from "@fortawesome/pro-solid-svg-icons";

export const ToolbarVideoButtonData = [
  {
    name: ToolbarVideoButtonNames.MOVE,
    icon: faArrowsUpDownLeftRight,
  },
  {
    name: ToolbarVideoButtonNames.ROTATE,
    icon: faArrowsRotate,
  },
  {
    name: ToolbarVideoButtonNames.AI_STYLIZE,
    icon: faHatWitch,
  },
  {
    name: ToolbarVideoButtonNames.MOVE_LAYER_UP,
    icon: faArrowUpFromLine,
  },
  {
    name: ToolbarVideoButtonNames.MOVE_LAYER_DOWN,
    icon: faArrowDownFromLine,
  },
  {
    name: ToolbarVideoButtonNames.DELETE,
    icon: faTrashCan,
  },
];
