import { H4 } from ".";

interface ItemPickerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  label: string
}

export const ItemPicker = ({
  label,
  ...imgProps
}:ItemPickerProps) => {
  return (
    <div className="relative border border-ui-border rounded-lg overflow-hidden">
      <img className="aspect-square min-w-20" {...imgProps} />
      <H4 className="absolute bottom-0 left-2 drop-shadow-md">{label}</H4>
    </div>
  )
}