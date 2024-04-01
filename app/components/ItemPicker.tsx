import { twMerge } from "tailwind-merge";
import { H4 } from ".";
import { ArtStyle } from "~/pages/PageEnigma/js/api_manager";

interface ItemPickerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  label: ArtStyle;
  selected: boolean;
  onSelected: (picked: ArtStyle) => void;
}

export const ItemPicker = ({
  label,
  selected = false,
  onSelected,
  ...imgProps
}: ItemPickerProps) => {
  const handleSelected = () => {
    onSelected(label);
  };

  return (
    <div
      className={twMerge(
        "relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ease-in-out",
        selected ? "border-brand-primary" : "border-ui-border",
      )}
      onClick={handleSelected}
    >
      <img className="aspect-square" {...imgProps} />
      <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-t from-gray-700" />
      <H4 className="absolute bottom-0 left-2 drop-shadow-md">{label}</H4>
    </div>
  );
};
