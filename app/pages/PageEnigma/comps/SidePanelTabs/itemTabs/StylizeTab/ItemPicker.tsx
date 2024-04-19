import { twMerge } from "tailwind-merge";
import { ArtStyle } from "~/pages/PageEnigma/js/api_manager";
import { H4 } from "~/components";
import { ImgHTMLAttributes } from "react";

interface ItemPickerProps extends ImgHTMLAttributes<HTMLImageElement> {
  label: string;
  type: ArtStyle;
  selected: boolean;
  onSelected: (picked: ArtStyle) => void;
}

export const ItemPicker = ({
  label,
  type,
  selected = false,
  onSelected,
  width,
  height,
  ...imgProps
}: ItemPickerProps) => {
  const handleSelected = () => {
    onSelected(type);
  };

  return (
    <button
      className={twMerge(
        "relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ease-in-out",
        selected ? "border-brand-primary" : "border-ui-border",
      )}
      style={{
        minWidth: (width as number) + 4,
        minHeight: (height as number) + 4,
        maxWidth: (width as number) + 4,
        maxHeight: (height as number) + 4,
      }}
      onClick={handleSelected}>
      <img
        className="object-fill"
        {...imgProps}
        alt="style"
        style={{
          minWidth: width,
          minHeight: height,
          maxWidth: width,
          maxHeight: height,
        }}
      />
      <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-t from-gray-700" />
      <H4 className="absolute bottom-[1px] left-[6px] text-start text-[13px] drop-shadow-md">
        {label}
      </H4>
    </button>
  );
};
