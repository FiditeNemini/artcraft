import { styleList } from "./data/styeList";
import { ArtStyleItem } from "./ArtStyleItem";
import { ArtStyleNames } from "./enums";

export const ArtStyleSelector = ({
  selectedArtStyle,
  onSelectedArtStyle,
}: {
  selectedArtStyle: ArtStyleNames;
  onSelectedArtStyle: (newArtStyle: ArtStyleNames) => void;
}) => {
  return (
    <div
      className="flex flex-col gap-4 overflow-hidden rounded-t-lg bg-ui-panel"
      style={{ height: "calc(100vh - 500px)" }}
    >
      <div className="overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {styleList.map((style) => (
            <ArtStyleItem
              key={style.type}
              label={style.label}
              type={style.type}
              selected={selectedArtStyle === style.type}
              onSelected={onSelectedArtStyle}
              src={style.image}
              className="aspect-video"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
