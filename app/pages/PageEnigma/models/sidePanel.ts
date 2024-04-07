import { AssetType } from "~/pages/PageEnigma/models/assets";
import { ReactNode } from "react";

export interface Tab {
  icon: string;
  title: string;
  value: AssetType;
  component: ReactNode;
}
