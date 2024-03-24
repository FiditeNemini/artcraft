import { useState, PointerEvent, MouseEvent } from "react";

export const useMouseEvents = (
  clip: { id: string; offset: number; length: number; name: string },
  max: number,
  min: number,
  updateClip: (id: string, offset: number, length: number) => void,
) => {
  const [isActive, setIsActive] = useState("");
  const [clientX, setClientX] = useState(0);

  const [offset, setOffset] = useState(clip.offset);
  const [length, setLength] = useState(clip.length);

  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>, type: string) => {
      if (event.button === 0) {
        const x = event.clientX - 40;
        setClientX(event.clientX);
        setIsActive(type);
      }
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (isActive) {
        updateClip(clip.id, offset, length);
        setIsActive("");
      }
    },
    onMouseLeave: () => {
      if (isActive) {
        updateClip(clip.id, offset, length);
        setIsActive("");
      }
    },
    onMouseMove: (event: MouseEvent) => {
      const deltaOffset = event.clientX - clientX + clip.offset;
      const delta = event.clientX - clientX;
      if (isActive === "drag") {
        if (deltaOffset < min || deltaOffset + length > max) {
          return;
        }
        setOffset(deltaOffset);
        return;
      }
      if (isActive === "left") {
        if (deltaOffset < min) {
          return;
        }
        setOffset(deltaOffset);
        setLength(clip.length - delta);
        return;
      }
      if (isActive === "right") {
        if (clip.length + delta < 30 || offset + clip.length + delta > max) {
          return;
        }
        setLength(clip.length + delta);
      }
    },
    length,
    offset,
  };
};
