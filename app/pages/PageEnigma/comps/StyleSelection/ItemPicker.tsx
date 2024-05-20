import { twMerge } from "tailwind-merge";
import { H4 } from "~/components";
import { ArtStyle } from "~/pages/PageEnigma/Editor/api_manager";

interface ItemPickerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
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
      onClick={handleSelected}
    >
      <img className="aspect-square" {...imgProps} alt="style" />
      <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-t from-gray-700" />
      <H4 className="absolute bottom-[1px] left-[6px] text-start text-sm drop-shadow-md">
        {label}
      </H4>
    </button>
  );
};
