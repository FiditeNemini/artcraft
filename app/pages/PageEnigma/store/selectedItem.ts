import { signal } from "@preact/signals-core";
import { Clip, Keyframe } from "~/pages/PageEnigma/models";

export const selectedItem = signal<Clip | Keyframe | null>(null);

export const ignoreKeyDelete = signal(false);

export enum DomLevels {
  NONE,
  INPUT,
  PANEL,
  DIALOGUE,
}
type HotkeysStatusType = {
  disabled: boolean,
  disabledBy: DomLevels,
}
export const hotkeysStatus = signal<HotkeysStatusType>({
  disabled:false,
  disabledBy:DomLevels.NONE,
});

export const isHotkeysDisabled = ()=>{
  return hotkeysStatus.value.disabled;
}
export const disableHotkeyInput = (level: number)=>{
  if(hotkeysStatus.value.disabled){
    if (level > hotkeysStatus.value.disabledBy){
      hotkeysStatus.value.disabledBy === level;
    }
  }else{
    hotkeysStatus.value = {
      disabled: true,
      disabledBy: level,
    }
  }
}
export const enableHotkeyInput = (level: number)=>{
  if(hotkeysStatus.value.disabled){
    if (level >= hotkeysStatus.value.disabledBy){
      hotkeysStatus.value = {
        disabled: false,
        disabledBy: DomLevels.NONE,
      }
    }
  }
}