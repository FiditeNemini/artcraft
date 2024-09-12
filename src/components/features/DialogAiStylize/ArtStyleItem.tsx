import { ImgHTMLAttributes, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ArtStyleNames } from "./enums";

interface ArtStyleItemProps extends ImgHTMLAttributes<HTMLImageElement> {
  label: string;
  type: ArtStyleNames;
  selected: boolean;
  onSelected: (picked: ArtStyleNames) => void;
  className?: string;
  defaultImg?: string;
}

export const ArtStyleItem = ({
  label,
  type,
  selected = false,
  defaultImg = "/resources/placeholders/style_placeholder.png",
  src = defaultImg,
  onSelected,
  // width,
  // height,
  className,
  ...imgProps
}: ArtStyleItemProps) => {
  const handleSelected = () => {
    onSelected(type);
  };

  const [imageSrc, setImageSrc] = useState<string>(defaultImg);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageSrc(src);
    img.onerror = () => setImageSrc(defaultImg);
    img.src = src || defaultImg;
  }, [src, defaultImg]);

  return (
    <button
      className={twMerge(
        "relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ease-in-out",
        selected
          ? "border-primary"
          : "border-ui-border hover:border-primary-300",
        className,
      )}
      // style={{
      //   minWidth: (width as number) + 4,
      //   minHeight: (height as number) + 4,
      //   maxWidth: (width as number) + 4,
      //   maxHeight: (height as number) + 4,
      // }}
      onClick={handleSelected}
    >
      <img
        className="h-full w-full object-cover"
        src={imageSrc}
        {...imgProps}
        alt={label}
        // style={{
        //   minWidth: width,
        //   minHeight: height,
        //   maxWidth: width,
        //   maxHeight: height,
        // }}
      />
      <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-ui-panel" />
      <h4 className="absolute bottom-0 left-1 truncate text-start text-sm drop-shadow-md">
        {label}
      </h4>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className={`absolute right-2 top-2 size-5 shadow-xl transition-opacity duration-200 ease-in-out ${
          selected ? "opacity-100" : "opacity-0"
        }`}
      >
        <path
          opacity="1"
          d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c-9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
          fill="#FC6B68"
        />
        <path
          d="M369 175c-9.4 9.4-9.4 24.6 0 33.9L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c-9.4-9.4 24.6-9.4 33.9 0z"
          fill="#FFFFFF"
        />
      </svg>
    </button>
  );
};
