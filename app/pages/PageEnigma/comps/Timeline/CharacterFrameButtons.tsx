import { faImage } from "@fortawesome/pro-solid-svg-icons";
import { ButtonIconStack } from "~/components/reusable/ButtonIconStack";
import { frameTrackButtonWidthPx } from "../../signals";
import { useCallback, useContext, useState } from "react";
import { EngineContext } from "../../contexts/EngineContext";
import { CHARACTER_FRAME_FILE_TYPE } from "~/enums";
import { UploadModalMedia } from "~/components/reusable/UploadModalMedia";
import { UploadImageMediaModal } from "~/components/reusable/UploadModalMedia/UploadImageMediaModal";

export enum CharacterFrameTarget {
  Start,
  End
}

export interface CharacterFrameButtonProps {
  target: CharacterFrameTarget;
  characterId: string;
  className?: string;
}

export const CharacterFrameStrings = {
  [CharacterFrameTarget.Start]: "Start Frame",
  [CharacterFrameTarget.End]: "End Frame"
}

export default function CharacterFrameButton(
  {
    target,
    characterId,
    className,
  }: CharacterFrameButtonProps
) {

  const editorEngine = useContext(EngineContext);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleFrameClick = useCallback(() => {

  })

  return (
    <>
      <div className={className} style={{ minWidth: frameTrackButtonWidthPx, width: frameTrackButtonWidthPx }}>
        <ButtonIconStack icon={faImage} additionalStyle="bg-character-frame" text={CharacterFrameStrings[target]} onClick={() => setIsUploadModalOpen(true)} />
      </div>
      <UploadImageMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(data) => { console.log(data); setIsUploadModalOpen(false) }}
        title={"Upload Character Frame Image"}
        fileTypes={Object.values(CHARACTER_FRAME_FILE_TYPE)}
      />
    </>
  )
}
