import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { H4, Label } from "~/components";
import { ArtStyle } from "~/pages/PageEnigma/enums";

interface StyleSelectionButtonProps {
  onClick: () => void;
  selectedStyle: ArtStyle;
  label: string;
  imageSrc: string;
}

export function StyleSelectionButton({
  onClick,
  label,
  imageSrc,
}: StyleSelectionButtonProps) {
  return (
    <div className="flex flex-col">
      <Label>Select a Style</Label>
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-white/30 bg-ui-controls-button/70 p-2 pr-3 text-start transition-all hover:border-brand-primary hover:bg-ui-controls-button/60"
        onClick={onClick}
      >
        <div className="aspect-video w-20 overflow-hidden rounded-md bg-ui-controls-button/100">
          <img src={imageSrc} alt={label} className="object-cover" />
        </div>
        <div className="grow">
          <>
            <H4>{label}</H4>
          </>
        </div>
        <FontAwesomeIcon icon={faChevronRight} className="text-xl opacity-60" />
      </button>
    </div>
  );
}
