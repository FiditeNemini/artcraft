import { twMerge } from "tailwind-merge";
import { H4 } from ".";


interface ItemPickerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  label: string
  selected: boolean;
  onSelected : (val:string)=>void;
}

export const ItemPicker = ({
  label,
  selected = false,
  onSelected,
  ...imgProps
}:ItemPickerProps) => {

  const handleSelected = ()=>{
    onSelected(label);
  };

  return (
    <div
      className={twMerge("relative border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ease-in-out", selected ? "border-brand-primary" : "border-ui-border")}
      onClick={handleSelected}
    >
      <img className="aspect-square min-w-20" {...imgProps} />
      <div className="bg-gradient-to-t from-gray-700 absolute top-0 left-0 w-full h-full"/>
      <H4 className="absolute bottom-0 left-2 drop-shadow-md">{label}</H4>
    </div>
  )
}