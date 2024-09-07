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
  },
  {
    name: ToolbarImageButtonNames.ROTATE,
    icon: faArrowsRotate,
  },
  {
    name: ToolbarImageButtonNames.AI_STYLIZE,
    icon: faHatWitch,
  },
  {
    name: ToolbarImageButtonNames.MOVE_LAYER_UP,
    icon: faArrowUpFromLine,
  },
  {
    name: ToolbarImageButtonNames.MOVE_LAYER_DOWN,
    icon: faArrowDownFromLine,
  },
  {
    name: ToolbarImageButtonNames.DELETE,
    icon: faTrashCan,
  },
];
