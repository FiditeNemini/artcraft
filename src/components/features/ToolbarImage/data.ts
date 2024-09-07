import { ToolbarImageButtonNames } from "./enums";
import {
  faArrowUpFromLine,
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faArrowDownFromLine,
  // faEraser,
  // faPaintbrush,
  faTrashCan,
  // faWandMagicSparkles,
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
    name: ToolbarImageButtonNames.MOVE_LAYER_UP,
    icon: faArrowUpFromLine,
  },
  {
    name: ToolbarImageButtonNames.MOVE_LAYER_DOWN,
    icon: faArrowDownFromLine,
  },
  // {
  //   name: ToolbarImageButtonNames.ERASE,
  //   icon: faEraser,
  // },
  // {
  //   name: ToolbarImageButtonNames.PAINT,
  //   icon: faPaintbrush,
  // },
  // {
  //   name: ToolbarImageButtonNames.MAGIC,
  //   icon: faWandMagicSparkles,
  // },
  {
    name: ToolbarImageButtonNames.DELETE,
    icon: faTrashCan,
  },
];
