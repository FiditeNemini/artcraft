import { ToolbarImageButtonNames } from "./enums";
import {
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faEraser,
  faPaintbrush,
  faTrashCan,
  faWandMagicSparkles,
} from "@fortawesome/pro-thin-svg-icons";

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
    name: ToolbarImageButtonNames.ERASE,
    icon: faEraser,
  },
  {
    name: ToolbarImageButtonNames.PAINT,
    icon: faPaintbrush,
  },
  {
    name: ToolbarImageButtonNames.MAGIC,
    icon: faWandMagicSparkles,
  },
  {
    name: ToolbarImageButtonNames.DELETE,
    icon: faTrashCan,
  },
];
