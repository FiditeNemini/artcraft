import React from "react";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
import {
  addCharacter,
  addCharacterAnimation,
  addCharacterAudio,
  addCharacterExpression,
  addGlobalAudio,
  addObject,
  canDrop,
  currPosition,
  dragItem,
  overTimeline,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import { pageHeight } from "~/store";
import { addShape } from "~/pages/PageEnigma/store/shape";

class DndAsset {
  public dropId: string = "";
  public overElement: DOMRect | null = null;
  public dropOffset = 0;
  public initX = 0;
  public initY = 0;
  public notDropText = "";

  constructor() {
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }

  onPointerDown(event: React.PointerEvent<HTMLDivElement>, item: MediaItem) {
    if (event.button === 0) {
      dragItem.value = item;
      currPosition.value = {
        currX: event.pageX,
        currY: event.pageY,
      };
      this.initX = event.pageX;
      this.initY = event.pageY;
      canDrop.value = false;
      this.notDropText = "";
      window.addEventListener("pointerup", this.onPointerUp);
      window.addEventListener("pointermove", this.onPointerMove);
    }
  }

  endDrag() {
    if (dragItem.value) {
      dragItem.value = null;
      canDrop.value = false;
      this.overElement = null;
      overTimeline.value = false;
      this.notDropText = "";
    }
  }

  onPointerUp() {
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    if (!canDrop.value) {
      this.endDrag();
      return;
    }

    if (dragItem.value) {
      const mediaItem = dragItem.value;
      if (mediaItem.type === AssetType.CHARACTER) {
        addCharacter(dragItem.value);
      }
      // if (dragItem.value.type === AssetType.CAMERA) {
      //   console.log("Dragged In Camera Type")
      // }
      if (dragItem.value.type === AssetType.OBJECT) {
        addObject(dragItem.value);
      }

      if (dragItem.value.type === AssetType.SHAPE) {
        addShape(dragItem.value);
      }
    }

    if (canDrop.value && dragItem.value) {
      if (dragItem.value.type === AssetType.ANIMATION) {
        addCharacterAnimation({
          dragItem: dragItem.value,
          characterId: this.dropId,
          offset: this.dropOffset,
        });
      }
      if (dragItem.value.type === AssetType.EXPRESSION) {
        addCharacterExpression({
          dragItem: dragItem.value,
          characterId: this.dropId,
          offset: this.dropOffset,
        });
      }
      if (dragItem.value.type === AssetType.AUDIO) {
        addCharacterAudio({
          dragItem: dragItem.value,
          characterId: this.dropId,
          offset: this.dropOffset,
        });
        addGlobalAudio({
          dragItem: dragItem.value,
          audioId: this.dropId,
          offset: this.dropOffset,
        });
      }
    }
    this.endDrag();
  }

  onPointerMove(event: MouseEvent) {
    if (dragItem.value) {
      event.stopPropagation();
      event.preventDefault();
      const deltaX = event.pageX - this.initX;
      const deltaY = event.pageY - this.initY;
      currPosition.value = {
        currX: this.initX + deltaX,
        currY: this.initY + deltaY,
      };
      overTimeline.value =
        event.pageY > pageHeight.value - timelineHeight.value;
      if (this.overElement) {
        const pos = this.overElement;
        const eventY = event.pageY;
        const inHeight = eventY >= pos.top && eventY <= pos.top + pos.height;
        const eventX = event.pageX;
        const inWidth = eventX >= pos.left && eventX <= pos.left + pos.width;

        if (inHeight && inWidth) {
          return;
        }
        canDrop.value = false;
        this.dropId = "";
        this.overElement = null;
        this.notDropText = "";
      }
    }
  }
}

const dragAndDrop = new DndAsset();

export default dragAndDrop;
